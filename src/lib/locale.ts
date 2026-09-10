import type { i18n as I18n } from 'i18next';
import { isLang, type Lang } from '@/lib/site';

const LANG_STORAGE_KEY = 'lang';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// 언어 상태는 세 군데에 산다 — i18next, 미들웨어가 보는 NEXT_LOCALE 쿠키, <html lang>.
// 하나라도 어긋나면 "메뉴에서 독일어를 골랐는데 링크를 누르면 한국어로 돌아가는" 상태가
// 된다(미들웨어가 쿠키를 최우선으로 보기 때문). 반드시 여기서만 함께 바꾼다.
export function setLocale(i18n: I18n, lang: Lang): void {
  if (i18n.language !== lang) i18n.changeLanguage(lang);
  if (typeof document === 'undefined') return;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // 시크릿 모드 등 저장 불가 — 쿠키만으로도 동작한다
  }
  document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.documentElement.lang = lang;
}

/** 사용자가 이전에 고른 언어(없으면 null). */
export function storedLocale(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

/**
 * 현재 경로를 같은 페이지의 다른 언어판 경로로 바꾼다.
 * 언어를 바꿨을 때 홈으로 튕기지 않고 보던 페이지에 머물게 하기 위함.
 * 한국어는 접두사 없는 루트가 대표본이다.
 */
export function localizePath(pathname: string, lang: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isLang(segments[0])) {
    segments.shift();
  }
  const rest = segments.join('/');
  if (lang === 'ko') return rest ? `/${rest}` : '/';
  return rest ? `/${lang}/${rest}` : `/${lang}`;
}
