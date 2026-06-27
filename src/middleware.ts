import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 검색엔진·AI 크롤러는 루트(한국어 대표본) 그대로 두어 색인 안정성 유지
const BOTS =
  /bot|crawler|spider|slurp|yeti|googlebot|bingbot|duckduckbot|applebot|claudebot|gptbot|oai-searchbot|perplexitybot|google-extended|amazonbot|bytespider|ccbot|meta-externalagent|anthropic-ai|cohere-ai|diffbot|youbot/i;

// 브라우저 언어 태그(prefix)와 실제 라우트 매핑.
// 1차 언어 한국어는 루트(/)이므로 여기에 없음 — ko 선호 사용자는 루트에 머문다.
const ROUTE_BY_LANG: Record<string, string> = {
  en: '/en',
  'en-us': '/en',
  'en-gb': '/en',
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

// 모든 요청에 x-pathname 헤더를 심어 layout에서 경로별 lang 분기가 가능하게 함
function withPathname(req: NextRequest): NextResponse {
  const headers = new Headers(req.headers);
  headers.set('x-pathname', req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 루트가 아닌 경로는 x-pathname만 주입하고 통과
  if (pathname !== '/') return withPathname(req);

  const ua = (req.headers.get('user-agent') || '').toLowerCase();
  if (BOTS.test(ua)) return withPathname(req);

  // 사용자가 직접 선택한 언어 쿠키가 있으면 최우선 존중
  const cookieLang = req.cookies.get('NEXT_LOCALE')?.value?.toLowerCase();
  if (cookieLang) {
    // 한국어 선호는 루트(한국어 대표본)에 그대로 머문다
    if (cookieLang.startsWith('ko')) return withPathname(req);
    const target =
      ROUTE_BY_LANG[cookieLang] ?? ROUTE_BY_LANG[cookieLang.split('-')[0]];
    if (target) return NextResponse.redirect(new URL(target, req.url));
  }

  const accept = req.headers.get('accept-language') || '';
  if (!accept) return withPathname(req);

  const langs = accept
    .toLowerCase()
    .split(',')
    .map((l) => l.trim().split(';')[0])
    .filter(Boolean);

  for (const lang of langs) {
    if (lang.startsWith('ko')) return withPathname(req); // 한국어가 우선이면 루트(ko) 유지
    const full = ROUTE_BY_LANG[lang];
    const prefix = ROUTE_BY_LANG[lang.split('-')[0]];
    const target = full ?? prefix;
    if (target) return NextResponse.redirect(new URL(target, req.url));
  }

  // 지원하지 않는 언어 → 한국어(루트) 유지
  return withPathname(req);
}

export const config = {
  // _next 내부, api 내부, 정적 파일 확장자는 제외한 모든 경로에 matcher
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|txt|xml|json|map|js|css|woff|woff2)$).*)'],
};
