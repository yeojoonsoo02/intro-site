import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/clientIp';
import { checkRateLimit, RATE_LIMIT_MAX_PORTFOLIO } from '@/lib/rateLimit';
import { isLang } from '@/lib/site';
import { getPortfolioData } from '@/features/portfolio/portfolioData';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // 봇·공격자의 반복 호출로 인한 Firestore 읽기 비용만 차단. 정상 방문자의 다중 페이지
  // 조회(메인+프로젝트 상세 여러 개)는 막지 않도록 챗봇용(5회)이 아닌 전용 임계값을 쓴다.
  const ip = getClientIp(req);
  const rateLimit = await checkRateLimit(`pf_${ip}`, false, RATE_LIMIT_MAX_PORTFOLIO);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const rawLang = req.nextUrl.searchParams.get('lang') || 'ko';
  const lang = isLang(rawLang) ? rawLang : 'ko';

  // 데이터가 없는 언어(es·fr·de·pt·ru)는 getPortfolioData가 영어판으로 돌려준다.
  const data = await getPortfolioData(lang);
  if (!data) {
    return NextResponse.json({ error: 'Portfolio unavailable' }, { status: 503 });
  }

  return NextResponse.json(data, {
    headers: {
      // CDN·엣지 캐시로 Firestore 중복 접근 최소화(5분 fresh + 30분 SWR)
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
    },
  });
}
