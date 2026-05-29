import { SITE_CREATED, SITE_MODIFIED, SITE_URL } from './constants';
import { personEntity } from './person';

export const profilePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}#profilepage`,
  url: SITE_URL,
  name: '여준수 (Yeojunsu) — 공식 프로필',
  description:
    '대학생 개발자 여준수(Yeojunsu)의 공식 프로필 페이지. 자기소개와 연락처를 확인할 수 있습니다.',
  dateCreated: SITE_CREATED,
  dateModified: SITE_MODIFIED,
  inLanguage: 'ko-KR',
  mainEntity: personEntity,
  about: personEntity,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '.sr-only p'],
  },
  hasPart: [
    { '@type': 'WebPage', '@id': `${SITE_URL}/about`, name: '공식 소개', url: `${SITE_URL}/about` },
    { '@type': 'WebPage', '@id': `${SITE_URL}/journey`, name: '여정', url: `${SITE_URL}/journey` },
    { '@type': 'WebPage', '@id': `${SITE_URL}/portfolio`, name: '포트폴리오', url: `${SITE_URL}/portfolio` },
  ],
};
