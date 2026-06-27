import { adminDb, FieldValue } from './firebaseAdmin';

const RATE_LIMIT_MAX_GUEST = 5;
const RATE_LIMIT_MAX_USER = 20;
// 공개 읽기 API(포트폴리오)는 챗봇용 제한과 달리 정상 방문자의 다중 페이지 조회를 막지 않도록
// 넉넉한 임계값을 둔다. CDN s-maxage 캐시와 함께 Firestore 폭주만 차단하는 용도.
export const RATE_LIMIT_MAX_PORTFOLIO = 120;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const DAILY_MAX_REQUESTS = 500;

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

  // Firestore-based: persistent across serverless instances
  const docRef = adminDb.collection('rate_limits').doc(ip.replace(/[/.]/g, '_'));
  try {
    const snap = await docRef.get();
    const data = snap.exists ? snap.data() : null;

    if (!data || now > (data.resetAt ?? 0)) {
      await docRef.set({ count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS, isLoggedIn });
      localCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: max - 1 };
    }

    if (data.count >= max) {
      localCache.set(ip, { count: data.count, resetAt: data.resetAt });
      return { allowed: false, remaining: 0 };
    }

    await docRef.update({ count: FieldValue.increment(1) });
    const newCount = data.count + 1;
    localCache.set(ip, { count: newCount, resetAt: data.resetAt });
    return { allowed: true, remaining: max - newCount };
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

  const today = new Date().toISOString().slice(0, 10);
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

  const today = new Date().toISOString().slice(0, 10);
  const docRef = adminDb.collection('rate_limits').doc(`daily_${today}`);

  try {
    await docRef.set({ count: FieldValue.increment(1), date: today }, { merge: true });
  } catch (err) {
    console.error('[DailyBudget] increment error:', err);
  }
}
