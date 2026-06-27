const SITE_URL = 'https://yeojoonsoo02.com';

export type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr' | 'de' | 'pt' | 'ru';

// 각 언어의 canonical URL. 이 사이트의 1차 언어는 한국어이므로 루트(/)가 한국어를 대표한다.
// 영어는 별도 경로(/en)로 분리. (이전엔 영어=루트였으나 루트 렌더가 한국어라 모순이었음)
const LANG_URL: Record<SupportedLang, string> = {
  ko: SITE_URL,
  en: `${SITE_URL}/en`,
  ja: `${SITE_URL}/ja`,
  zh: `${SITE_URL}/zh`,
  es: `${SITE_URL}/es`,
  fr: `${SITE_URL}/fr`,
  de: `${SITE_URL}/de`,
  pt: `${SITE_URL}/pt`,
  ru: `${SITE_URL}/ru`,
};

/**
 * Next.js metadata.alternates.languages 값 생성. 9개 언어 + x-default 일괄 반환.
 * 각 locale page.tsx가 같은 블록을 반복 선언할 필요 없이 이 유틸을 호출하면 됨.
 */
export function buildHreflangLanguages() {
  return {
    ...LANG_URL,
    'x-default': SITE_URL,
  };
}

/**
 * 특정 언어의 canonical URL 반환. (overrides 하고 싶으면 그대로 string으로)
 */
export function canonicalForLang(lang: SupportedLang): string {
  return LANG_URL[lang];
}

/**
 * JSON-LD 안전 직렬화. </script> 등 HTML break-out 시퀀스를 차단해
 * dangerouslySetInnerHTML 사용 시 XSS 표면을 제거한다.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--')
    // U+2028(LINE SEPARATOR)/U+2029(PARAGRAPH SEPARATOR)는 JSON에선 유효하지만
    // 스크립트 파싱 시 줄바꿈으로 해석돼 파싱이 깨질 수 있어 escape 처리.
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
