import { SITE_URL } from './constants';
import type { ProfileLang } from './profilePage';

// 사이트가 지원하는 전체 언어(WebSite.inLanguage). 라우트 언어와 무관하게 동일.
const SITE_LANGUAGES = [
  'ko-KR',
  'en',
  'ja-JP',
  'zh-CN',
  'es-ES',
  'fr-FR',
  'de-DE',
  'pt-BR',
  'ru-RU',
];

// 현재 페이지 언어에 맞춘 사이트명(한국어 외에는 영문 표기로 통일).
const SITE_NAME_BY_LANG: Record<ProfileLang, string> = {
  ko: '여준수 | 자기소개 사이트',
  en: 'Yeojunsu | Personal Site',
  ja: 'ヨ・ジュンス | 自己紹介サイト',
  zh: '余俊秀 | 个人简介网站',
  es: 'Yeojunsu | Sitio personal',
  fr: 'Yeojunsu | Site personnel',
  de: 'Yeojunsu | Persönliche Website',
  pt: 'Yeojunsu | Site pessoal',
  ru: 'Yeojunsu | Личный сайт',
};

/**
 * 현재 페이지 언어(lang)에 맞춰 WebSite JSON-LD를 생성한다.
 * name을 lang별로 분기해 영어 페이지 등에서 화면 사이트명과 상충하지 않게 한다.
 */
export function buildWebsiteSchema(lang: ProfileLang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: SITE_NAME_BY_LANG[lang],
    alternateName: 'Yeojunsu Personal Site',
    url: SITE_URL,
    inLanguage: SITE_LANGUAGES,
    author: { '@id': `${SITE_URL}#person` },
    copyrightHolder: { '@id': `${SITE_URL}#person` },
  };
}
