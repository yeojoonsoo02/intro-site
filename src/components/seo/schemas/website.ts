import { SITE_URL } from './constants';

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  name: '여준수 | 자기소개 사이트',
  alternateName: 'Yeojunsu Personal Site',
  url: SITE_URL,
  inLanguage: [
    'ko-KR',
    'en',
    'ja-JP',
    'zh-CN',
    'es-ES',
    'fr-FR',
    'de-DE',
    'pt-BR',
    'ru-RU',
  ],
  author: { '@id': `${SITE_URL}#person` },
  copyrightHolder: { '@id': `${SITE_URL}#person` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};
