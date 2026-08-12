import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { checkRateLimit, RATE_LIMIT_MAX_PORTFOLIO } from '@/lib/rateLimit';
import { LANG_CODES } from '@/lib/i18n-config';

// 프로필을 서버 경유로 읽는다. 브라우저가 firestore.googleapis.com에 직접 붙으면
// 그 도메인이 차단된 망(중국 등)·광고 차단기 환경에서 랜딩의 주요 콘텐츠가 비어버린다.
// 읽기 전용이며 profiles는 원래 공개 읽기(rules: allow read: if true)라 노출 범위 변화는 없다.

export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = await checkRateLimit(`pf_${ip}`, false, RATE_LIMIT_MAX_PORTFOLIO);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const rawLang = req.nextUrl.searchParams.get('lang') || 'ko';
  const lang = (LANG_CODES as readonly string[]).includes(rawLang) ? rawLang : 'ko';

  if (!adminDb) {
    return NextResponse.json({ error: 'Admin SDK not available' }, { status: 500 });
  }

  const col = adminDb.collection('profiles');
  const [main, dev] = await Promise.allSettled([
    col.doc(`main_${lang}`).get(),
    col.doc(`dev_${lang}`).get(),
  ]);

  const pick = (r: PromiseSettledResult<FirebaseFirestore.DocumentSnapshot>) =>
    r.status === 'fulfilled' && r.value.exists ? r.value.data() : null;

  return NextResponse.json(
    { main: pick(main), dev: pick(dev) },
    {
      headers: {
        // CDN에서 대부분 처리되게 해 Firestore 읽기와 함수 호출을 함께 줄인다.
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
      },
    },
  );
}
