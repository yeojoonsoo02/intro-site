// 사이트 전역 단일 출처 — URL·지원 언어·언어별 경로.
// 로케일 목록을 늘릴 때 여기만 고치면 라우트(generateStaticParams)·sitemap·hreflang·
// IndexNow·미들웨어·API 검증이 함께 따라온다.

export const SITE_URL = 'https://yeojoonsoo02.com';
export const SITE_HOST = 'yeojoonsoo02.com';
export const PROFILE_IMAGE = `${SITE_URL}/profile.jpg`;

export const LANGS = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'pt', 'ru'] as const;
export type Lang = (typeof LANGS)[number];

/** 한국어는 루트(/)가 대표본이라 접두사가 없다. 나머지는 /{lang} 아래에 산다. */
export const PREFIXED_LANGS = LANGS.filter((l): l is Exclude<Lang, 'ko'> => l !== 'ko');

export const LANG_LABELS: Record<Lang, string> = {
  ko: '한국어', en: 'English', ja: '日本語', zh: '中文', es: 'Español',
  fr: 'Français', de: 'Deutsch', pt: 'Português', ru: 'Русский',
};

/** Open Graph locale */
export const OG_LOCALE: Record<Lang, string> = {
  ko: 'ko_KR', en: 'en_US', ja: 'ja_JP', zh: 'zh_CN', es: 'es_ES',
  fr: 'fr_FR', de: 'de_DE', pt: 'pt_BR', ru: 'ru_RU',
};

/** BCP-47 (JSON-LD inLanguage 등) */
export const BCP47: Record<Lang, string> = {
  ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', es: 'es-ES',
  fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', ru: 'ru-RU',
};

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as readonly string[]).includes(v);
}

/** 언어별 경로. path는 선행 슬래시 없이('about'). */
export function langPath(lang: Lang, path = ''): string {
  const suffix = path ? `/${path}` : '';
  return lang === 'ko' ? suffix || '/' : `/${lang}${suffix}`;
}

export function langUrl(lang: Lang, path = ''): string {
  return `${SITE_URL}${langPath(lang, path)}`;
}

/** metadata.alternates.languages / sitemap alternates 용 hreflang 표 (x-default = 한국어). */
export function hreflangFor(path = ''): Record<string, string> {
  return {
    ...Object.fromEntries(LANGS.map((l) => [l, langUrl(l, path)])),
    'x-default': langUrl('ko', path),
  };
}
