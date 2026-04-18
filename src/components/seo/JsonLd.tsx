const SITE_URL = 'https://yeojoonsoo02.com';
const SITE_CREATED = '2026-02-28';
const SITE_MODIFIED = '2026-04-18';

const personEntity = {
  '@type': 'Person',
  '@id': `${SITE_URL}#person`,
  name: '여준수',
  alternateName: [
    'Yeo Joonsoo',
    'Junsu Yeo',
    'ヨ・ジュンス',
    '余俊秀',
    'yeojoonsoo',
    'yeojoonsoo02',
  ],
  givenName: '준수',
  familyName: '여',
  gender: 'Male',
  nationality: 'KR',
  url: SITE_URL,
  image: `${SITE_URL}/profile.jpg`,
  email: 'mailto:yeojoonsoo02@gmail.com',
  jobTitle: '대학생 개발자 (Student Developer)',
  description:
    '대학생 개발자 여준수(Yeo Joonsoo). 프론트엔드 개발과 AI 연구에 관심을 두고 개인 프로젝트를 운영합니다.',
  knowsLanguage: ['ko', 'en', 'ja', 'zh'],
  knowsAbout: [
    'Frontend Development',
    'TypeScript',
    'React',
    'Next.js',
    'Artificial Intelligence',
    '프론트엔드 개발',
    '인공지능',
    '개인 비즈니스 운영',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nowon-gu',
    addressRegion: 'Seoul',
    addressCountry: 'KR',
  },
  // 양방향 연결로 엔티티 동일성 검증 — 실제 존재하는 프로필만 등재
  sameAs: [
    'https://github.com/yeojoonsoo02',
  ],
};

const profilePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}#profilepage`,
  url: SITE_URL,
  name: '여준수 (Yeo Joonsoo) — 공식 프로필',
  description:
    '대학생 개발자 여준수(Yeo Joonsoo)의 공식 프로필 페이지. 자기소개, 기술 스택, 관심사, 연락처.',
  dateCreated: SITE_CREATED,
  dateModified: SITE_MODIFIED,
  inLanguage: 'ko-KR',
  mainEntity: personEntity,
  about: personEntity,
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  name: '여준수 | 자기소개 사이트',
  alternateName: 'Yeo Joonsoo Personal Site',
  url: SITE_URL,
  inLanguage: ['ko-KR', 'en', 'ja-JP', 'zh-CN'],
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

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '여준수는 누구인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          '여준수(Yeo Joonsoo)는 서울에 거주하는 대학생 개발자입니다. 프론트엔드 개발과 AI 연구를 중심으로 개인 프로젝트를 운영하고 있습니다.',
      },
    },
    {
      '@type': 'Question',
      name: '여준수의 공식 사이트는 어디인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `여준수의 공식 사이트는 ${SITE_URL} 입니다.`,
      },
    },
    {
      '@type': 'Question',
      name: '여준수와 연락하려면 어떻게 하나요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          '이메일 yeojoonsoo02@gmail.com 로 연락하실 수 있습니다. 프로필 페이지와 GitHub(github.com/yeojoonsoo02)에서도 확인 가능합니다.',
      },
    },
    {
      '@type': 'Question',
      name: '여준수의 주요 기술 스택은 무엇인가요?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'React, Next.js, TypeScript 기반의 프론트엔드 개발을 주로 하며, AI 연구와 개인 비즈니스 자동화 도구 개발에도 관심이 있습니다.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: '여준수',
      item: SITE_URL,
    },
  ],
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
