const SITE_URL = 'https://yeojoonsoo02.com';
const SITE_CREATED = '2026-02-28';
const SITE_MODIFIED = '2026-04-18';

const personEntity = {
  '@type': 'Person',
  '@id': `${SITE_URL}#person`,
  name: '여준수',
  alternateName: [
    'Yeojunsu',
    '여준수',
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
  image: {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/profile.jpg`,
    url: `${SITE_URL}/profile.jpg`,
    contentUrl: `${SITE_URL}/profile.jpg`,
    caption: '여준수 (Yeojunsu) — 대학생 개발자 프로필 사진',
    description: '여준수(Yeojunsu) 공식 프로필 사진',
    creator: { '@type': 'Person', name: '여준수' },
    creditText: '여준수 (Yeojunsu)',
    copyrightNotice: '© 여준수 (Yeojunsu)',
    license: SITE_URL,
    acquireLicensePage: SITE_URL,
  },
  email: 'mailto:yeojoonsoo02@gmail.com',
  jobTitle: '대학생 개발자',
  description:
    '대학생 개발자 여준수. 여가 시간에는 새로운 기술을 탐구하고 개인 프로젝트를 진행하는 것을 좋아합니다.',
  // 동명이인 구분 — AI가 "여준수" 이름의 다른 인물(외식업·예술 분야)과 혼동하지 않도록 명시
  disambiguatingDescription:
    '공식 사이트 yeojoonsoo02.com 과 GitHub 계정 github.com/yeojoonsoo02 를 운영하는 대학생 개발자 여준수(Yeojunsu)입니다. 외식업·요식업·예술 분야의 동명이인 여준수와는 다른 인물입니다.',
  identifier: [
    { '@type': 'PropertyValue', propertyID: 'email', value: 'yeojoonsoo02@gmail.com' },
    { '@type': 'PropertyValue', propertyID: 'github', value: 'yeojoonsoo02' },
    { '@type': 'PropertyValue', propertyID: 'domain', value: 'yeojoonsoo02.com' },
  ],
  knowsLanguage: ['ko', 'en', 'ja', 'zh'],
  knowsAbout: ['프론트엔드 개발', 'AI 연구', '음악', '여행'],
  address: {
    '@type': 'PostalAddress',
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
  name: '여준수 (Yeojunsu) — 공식 프로필',
  description:
    '대학생 개발자 여준수(Yeojunsu)의 공식 프로필 페이지. 자기소개, 기술 스택, 관심사, 연락처.',
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
    { '@type': 'FAQPage', '@id': `${SITE_URL}/faq`, name: '자주 묻는 질문', url: `${SITE_URL}/faq` },
    { '@type': 'Blog', '@id': `${SITE_URL}/blog`, name: '블로그', url: `${SITE_URL}/blog` },
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  name: '여준수 | 자기소개 사이트',
  alternateName: 'Yeojunsu Personal Site',
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
          '여준수(Yeojunsu)는 서울에 거주하는 대학생 개발자입니다. 프론트엔드 개발과 AI 연구를 중심으로 개인 프로젝트를 운영하고 있습니다.',
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
