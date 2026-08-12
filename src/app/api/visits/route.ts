import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { checkRateLimit } from '@/lib/rateLimit';

// 방문자 수를 서버 경유로 센다. 브라우저가 Firestore에 직접 쓰던 구조는
// googleapis가 차단된 망에서 아예 동작하지 않았다.
//
// ⚠️ Admin SDK는 Firestore Rules를 우회한다. rules가 강제하던
// "정확히 1씩 증가 · count/updatedAt 키만" 조건을 여기서 대신 지켜야 한다.
// (increment(1)과 고정 페이로드로 그 성질을 그대로 유지한다.)

const COUNTER_DOC = 'visits';
const VISIT_COOKIE = 'v';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24시간 — 같은 방문자의 새로고침은 세지 않는다
const RATE_LIMIT_MAX_VISITS = 30;

// 쓰기 엔드포인트가 공개되므로 스크립트 호출을 막는 최소 검증.
// 브라우저의 정상 요청은 Origin 또는 Referer를 항상 보낸다.
function looksLikeBrowser(req: NextRequest): boolean {
  const ua = req.headers.get('user-agent') || '';
  if (ua.length < 10) return false;
  if (/bot|crawl|spider|curl|wget|python-requests|node-fetch|go-http|java\//i.test(ua)) return false;
  return Boolean(req.headers.get('origin') || req.headers.get('referer'));
}

async function readCount(): Promise<number> {
  if (!adminDb) return 0;
  const snap = await adminDb.collection('counters').doc(COUNTER_DOC).get();
  return (snap.data()?.count as number | undefined) ?? 0;
}

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(
      { count: await readCount() },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch (err) {
    console.error('[visits] read error', err);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!adminDb) return NextResponse.json({ count: 0 });

  // 이미 센 방문자는 증가시키지 않고 현재 값만 돌려준다.
  // 정확도(새로고침으로 부풀지 않음)와 비용(쓰기·함수 호출 감소)을 동시에 얻는다.
  if (req.cookies.get(VISIT_COOKIE)?.value === '1') {
    try {
      return NextResponse.json({ count: await readCount(), counted: false });
    } catch {
      return NextResponse.json({ count: 0, counted: false });
    }
  }

  if (!looksLikeBrowser(req)) {
    return NextResponse.json({ count: await readCount().catch(() => 0), counted: false });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = await checkRateLimit(`visit_${ip}`, false, RATE_LIMIT_MAX_VISITS);
  if (!rateLimit.allowed) {
    return NextResponse.json({ count: await readCount().catch(() => 0), counted: false });
  }

  try {
    const ref = adminDb.collection('counters').doc(COUNTER_DOC);
    // rules와 동일한 성질을 유지: 키는 count/updatedAt만, 증가는 정확히 1.
    await ref.set(
      { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    const count = await readCount();

    const res = NextResponse.json({ count, counted: true });
    res.cookies.set(VISIT_COOKIE, '1', {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
    return res;
  } catch (err) {
    console.error('[visits] increment error', err);
    return NextResponse.json({ count: 0, counted: false });
  }
}
