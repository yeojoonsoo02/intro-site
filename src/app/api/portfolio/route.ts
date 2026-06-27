import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { checkRateLimit, RATE_LIMIT_MAX_PORTFOLIO } from '@/lib/rateLimit';

const ALLOWED_LANGS = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'pt', 'ru'];

export async function GET(req: NextRequest): Promise<NextResponse> {
  // 봇·공격자의 반복 호출로 인한 Firestore 읽기 비용만 차단. 정상 방문자의 다중 페이지
  // 조회(메인+프로젝트 상세 여러 개)는 막지 않도록 챗봇용(5회)이 아닌 전용 임계값을 쓴다.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = await checkRateLimit(`pf_${ip}`, false, RATE_LIMIT_MAX_PORTFOLIO);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const rawLang = req.nextUrl.searchParams.get('lang') || 'ko';
  const lang = ALLOWED_LANGS.includes(rawLang) ? rawLang : 'ko';

  if (!adminDb) {
    return NextResponse.json({ error: 'Admin SDK not available' }, { status: 500 });
  }

  const col = adminDb.collection('portfolio');

  const docs = [
    'hero', 'summary', 'projects', 'skills', 'timeline',
    'certifications', 'testimonials', 'education',
    'personalInfo', 'goals', 'values', 'routine', 'hobbies',
  ];
  const snaps = await Promise.allSettled(
    docs.map((d) => col.doc(`${d}_${lang}`).get()),
  );

  const getData = (idx: number) =>
    snaps[idx].status === 'fulfilled' && snaps[idx].value.exists
      ? snaps[idx].value.data()
      : null;

  return NextResponse.json({
    hero: getData(0),
    summary: getData(1),
    projects: getData(2)?.items ?? [],
    skills: getData(3)?.categories ?? [],
    timeline: getData(4)?.items ?? [],
    certifications: getData(5)?.items ?? [],
    testimonials: getData(6)?.items ?? [],
    education: getData(7)?.items ?? [],
    personalInfo: getData(8)?.items ?? [],
    goals: getData(9)?.items ?? [],
    values: getData(10)?.items ?? [],
    routine: getData(11)?.items ?? [],
    hobbies: getData(12)?.categories ?? [],
  }, {
    headers: {
      // CDN·엣지 캐시로 Firestore 중복 접근 최소화(5분 fresh + 30분 SWR)
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
    },
  });
}
