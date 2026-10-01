import { adminDb, FieldValue, Timestamp } from './firebaseAdmin';

const RATE_LIMIT_MAX_GUEST = 5;
const RATE_LIMIT_MAX_USER = 20;
// 공개 읽기 API(포트폴리오)는 챗봇용 제한과 달리 정상 방문자의 다중 페이지 조회를 막지 않도록
// 넉넉한 임계값을 둔다. CDN s-maxage 캐시와 함께 Firestore 폭주만 차단하는 용도.
export const RATE_LIMIT_MAX_PORTFOLIO = 120;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const DAILY_MAX_REQUESTS = 500;
// 일일 카운터 문서를 남겨 두는 기간. 지나면 Firestore TTL 정책이 지운다.
const DAILY_DOC_RETENTION_MS = 3 * 24 * 60 * 60 * 1000;

// 문서마다 expireAt(Timestamp)을 넣는다. rate_limits 컬렉션에 expireAt 필드로 TTL 정책을
// 켜 두면 Firestore가 만료된 문서를 지운다 — 없으면 방문자 IP마다 문서가 영원히 쌓인다.
// (resetAt은 숫자라 TTL 정책의 기준 필드가 될 수 없다.)
const expireAt = (ms: number): Timestamp => Timestamp.fromMillis(ms);

// 일일 예산은 한국 날짜로 끊는다. UTC로 끊으면 한국 시간 오전 9시에 리셋된다.
function seoulDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// In-memory fast cache (reduces Firestore reads for rapid repeated requests from same IP)
const localCache = new Map<string, { count: number; resetAt: number }>();
let lastLocalCleanup = Date.now();

function cleanLocalCache(): void {
  const now = Date.now();
  if (now - lastLocalCleanup < 60_000) return;
  for (const [key, val] of localCache) {
    if (now > val.resetAt) localCache.delete(key);
  }
  if (localCache.size > 300) localCache.clear();
  lastLocalCleanup = now;
}

export async function checkRateLimit(
  ip: string,
  isLoggedIn: boolean,
  maxOverride?: number,
): Promise<RateLimitResult> {
  const max = maxOverride ?? (isLoggedIn ? RATE_LIMIT_MAX_USER : RATE_LIMIT_MAX_GUEST);
  const now = Date.now();

  cleanLocalCache();

  // Fast path: local cache says already over limit
  const cached = localCache.get(ip);
  if (cached && now < cached.resetAt && cached.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  // If Admin SDK not available, fall back to in-memory only
  if (!adminDb) {
    if (!cached || now > cached.resetAt) {
      localCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: max - 1 };
    }
    if (cached.count >= max) {
      return { allowed: false, remaining: 0 };
    }
    cached.count++;
    return { allowed: true, remaining: max - cached.count };
  }

  // Firestore-based: persistent across serverless instances.
  // 읽기→판정→쓰기를 트랜잭션으로 묶는다. 분리하면 동시 요청이 같은 count를 읽어
  // 상한을 넘겨 통과할 수 있다(챗봇 비용이 나가는 경로라 실제 손해로 이어짐).
  const docRef = adminDb.collection('rate_limits').doc(ip.replace(/[/.]/g, '_'));
  try {
    const outcome = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      const data = snap.exists ? snap.data() : null;

      if (!data || now > (data.resetAt ?? 0)) {
        const resetAt = now + RATE_LIMIT_WINDOW_MS;
        tx.set(docRef, { count: 1, resetAt, isLoggedIn, expireAt: expireAt(resetAt) });
        return { allowed: true, count: 1, resetAt };
      }

      const count: number = data.count ?? 0;
      const resetAt: number = data.resetAt;
      if (count >= max) {
        return { allowed: false, count, resetAt };
      }

      tx.update(docRef, { count: count + 1 });
      return { allowed: true, count: count + 1, resetAt };
    });

    localCache.set(ip, { count: outcome.count, resetAt: outcome.resetAt });
    return {
      allowed: outcome.allowed,
      remaining: outcome.allowed ? max - outcome.count : 0,
    };
  } catch (err) {
    console.error('[RateLimit] Firestore error, enforcing via local cache:', err);
    // Fail-closed: Firestore 장애 시에도 로컬 캐시 상한을 강제해 폭주를 막는다.
    if (!cached || now > cached.resetAt) {
      localCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: max - 1 };
    }
    if (cached.count >= max) {
      return { allowed: false, remaining: 0 };
    }
    cached.count++;
    return { allowed: true, remaining: max - cached.count };
  }
}

// 전역 일일 예산이 남았는지만 확인(차감하지 않음). 봇·검증 실패·per-IP 초과 요청이
// 예산을 소진시키지 못하도록, 실제 차감은 모든 검증 통과 후 consumeDailyBudget으로 분리한다.
export async function checkDailyBudget(): Promise<boolean> {
  if (!adminDb) return true;

  const today = seoulDate();
  const docRef = adminDb.collection('rate_limits').doc(`daily_${today}`);

  try {
    const snap = await docRef.get();
    const count = snap.exists ? (snap.data()?.count ?? 0) : 0;
    return count < DAILY_MAX_REQUESTS;
  } catch (err) {
    console.error('[DailyBudget] Firestore error:', err);
    return true; // fail open
  }
}

// 전역 일일 예산을 1 차감. 실제 외부 호출 직전(모든 검증 통과 후)에만 호출한다.
export async function consumeDailyBudget(): Promise<void> {
  if (!adminDb) return;

  const today = seoulDate();
  const docRef = adminDb.collection('rate_limits').doc(`daily_${today}`);

  try {
    await docRef.set(
      {
        count: FieldValue.increment(1),
        date: today,
        expireAt: expireAt(Date.now() + DAILY_DOC_RETENTION_MS),
      },
      { merge: true },
    );
  } catch (err) {
    console.error('[DailyBudget] increment error:', err);
  }
}
