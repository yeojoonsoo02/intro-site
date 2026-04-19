import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 검색엔진·AI 크롤러는 루트(영어) 그대로 두어 색인 안정성 유지
const BOTS =
  /bot|crawler|spider|slurp|yeti|googlebot|bingbot|duckduckbot|applebot|claudebot|gptbot|oai-searchbot|perplexitybot|google-extended|amazonbot|bytespider|ccbot|meta-externalagent|anthropic-ai|cohere-ai|diffbot|youbot/i;

// 브라우저 언어 태그(prefix)와 실제 라우트 매핑
const ROUTE_BY_LANG: Record<string, string> = {
  ko: '/ko',
  ja: '/ja',
  zh: '/zh',
  // 중화권 subtag는 zh로 집계
  'zh-cn': '/zh',
  'zh-tw': '/zh',
  'zh-hk': '/zh',
  'zh-sg': '/zh',
  es: '/es',
  'es-es': '/es',
  'es-419': '/es', // 라틴아메리카 공통 스페인어
  fr: '/fr',
  'fr-ca': '/fr',
  'fr-fr': '/fr',
  de: '/de',
  'de-at': '/de',
  'de-ch': '/de',
  pt: '/pt',
  'pt-br': '/pt',
  'pt-pt': '/pt',
  ru: '/ru',
  'ru-ru': '/ru',
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 루트만 처리(그 외 경로는 통과)
  if (pathname !== '/') return NextResponse.next();

  const ua = (req.headers.get('user-agent') || '').toLowerCase();
  if (BOTS.test(ua)) return NextResponse.next();

  // 사용자가 직접 선택한 언어 쿠키가 있으면 최우선 존중
  const cookieLang = req.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
  if (cookieLang) {
    const target =
      ROUTE_BY_LANG[cookieLang] ?? ROUTE_BY_LANG[cookieLang.split('-')[0]];
    if (target) return NextResponse.redirect(new URL(target, req.url));
    // en으로 쿠키 설정된 경우에는 루트 유지
    if (cookieLang.startsWith('en')) return NextResponse.next();
  }

  const accept = req.headers.get('accept-language') || '';
  if (!accept) return NextResponse.next();

  const langs = accept
    .toLowerCase()
    .split(',')
    .map((l) => l.trim().split(';')[0])
    .filter(Boolean);

  for (const lang of langs) {
    if (lang.startsWith('en')) return NextResponse.next(); // 영어가 우선이면 루트 유지
    const full = ROUTE_BY_LANG[lang];
    const prefix = ROUTE_BY_LANG[lang.split('-')[0]];
    const target = full ?? prefix;
    if (target) return NextResponse.redirect(new URL(target, req.url));
  }

  // 지원하지 않는 언어 → 영어(루트) 유지
  return NextResponse.next();
}

export const config = {
  // 루트(/)만 매칭. 정적 자원과 API는 건드리지 않음
  matcher: '/',
};
