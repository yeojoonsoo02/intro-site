import { LANG_CODES } from '@/lib/i18n-config';

// 언어 상태를 저장하는 곳이 세 군데다 — i18next(localStorage 'lang'),
// 미들웨어가 보는 NEXT_LOCALE 쿠키, 그리고 URL 경로.
// 하나라도 어긋나면 "메뉴에서 독일어를 골랐는데 링크를 누르면 한국어로 돌아가는"
// 상태가 된다(미들웨어가 쿠키를 최우선으로 보기 때문). 한 곳에서 함께 세팅한다.

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function persistLocale(lang: string): void {
  if (typeof document === 'undefined') return;
  localStorage.setItem('lang', lang);
  document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.documentElement.lang = lang;
}

/**
 * 현재 경로를 같은 페이지의 다른 언어판 경로로 바꾼다.
 * 언어를 바꿨을 때 홈으로 튕기지 않고 보던 페이지에 머물게 하기 위함.
 * 한국어는 접두사 없는 루트가 대표본이다.
 */
export function localizePath(pathname: string, lang: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && (LANG_CODES as readonly string[]).includes(segments[0])) {
    segments.shift();
  }
  const rest = segments.join('/');
  if (lang === 'ko') return rest ? `/${rest}` : '/';
  return rest ? `/${lang}/${rest}` : `/${lang}`;
}
