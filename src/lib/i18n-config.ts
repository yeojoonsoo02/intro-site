export const SUPPORTED_LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
] as const;

export const LANG_CODES = SUPPORTED_LANGS.map((l) => l.code);
