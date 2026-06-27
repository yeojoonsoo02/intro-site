import { SITE_URL } from './constants';

export const personEntity = {
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
    'Next.js·TypeScript·React 기반 웹 풀스택 개발과 AI 애플리케이션(OpenAI·Google Gemini API) 연동에 관심이 많은 대학생 개발자 여준수. 자신이 쓸 도구·서비스를 직접 만들며 개인 통합 관리 플랫폼, 스탯지니(stat-genie) 등 개인 프로젝트를 진행.',
  // 동명이인 구분 — 공식 사이트·GitHub 계정으로 이 인물을 특정
  disambiguatingDescription:
    '공식 사이트 yeojoonsoo02.com 과 GitHub 계정 github.com/yeojoonsoo02 를 운영하는 대학생 개발자 여준수(Yeojunsu)입니다. 같은 이름의 다른 인물과는 무관합니다.',
  identifier: [
    { '@type': 'PropertyValue', propertyID: 'email', value: 'yeojoonsoo02@gmail.com' },
    { '@type': 'PropertyValue', propertyID: 'github', value: 'yeojoonsoo02' },
    { '@type': 'PropertyValue', propertyID: 'domain', value: 'yeojoonsoo02.com' },
  ],
  // 본인이 실제 구사하는 언어. 사이트 자체의 다국어 라우팅(WebSite.inLanguage 9개)과 구분.
  // BCP-47 태그로 표기해 검색엔진이 언어를 정확히 파싱하도록 함.
  knowsLanguage: ['ko-KR'],
  // 본인이 직접 확인한 기술 역량(knowledge.ts) + 관심사. AI가 "무엇을 하는 개발자인지"
  // 인용 가능하도록 핵심 스택을 취미와 함께 노출.
  knowsAbout: [
    '소프트웨어 개발',
    '웹 풀스택 개발',
    'Next.js',
    'TypeScript',
    'React',
    'AI 애플리케이션 개발',
    '수영',
    '탁구',
    '독서',
    '체스',
  ],
  // jobTitle을 구조화한 Occupation — AI가 직무·근무 지역·보유 기술을 명확히 인지하도록 보강.
  hasOccupation: {
    '@type': 'Occupation',
    name: '소프트웨어 개발자',
    skills:
      'Next.js, TypeScript, React, Firebase, GCP, Prisma, Vercel, OpenAI API, Google Gemini API, Tasker 자동화',
    occupationLocation: {
      '@type': 'City',
      name: 'Seoul',
    },
  },
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: '광운대학교',
    department: '소프트웨어학과',
    url: 'https://www.kw.ac.kr/',
  },
  // 1~2년 단기 목표 — 본인 답변(2026-05-22) 기반.
  seeks: {
    '@type': 'Demand',
    name: '사용자가 있는 토이 프로젝트 출시',
    description: '1~2년 안 단기 목표',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nowon-gu',
    addressRegion: 'Seoul',
    addressCountry: 'KR',
  },
  // 활동 기반 지역 — address와 동일 사실을 Place로 노출해 지역 질의 매칭을 강화.
  homeLocation: {
    '@type': 'Place',
    name: '서울 노원구',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nowon-gu',
      addressRegion: 'Seoul',
      addressCountry: 'KR',
    },
  },
  // 양방향 연결로 엔티티 동일성 검증 — 실제 존재하는 프로필만 등재.
  // TODO(콘텐츠): LinkedIn·블로그(Velog 등) 확보 시 여기에 추가하면 AI 엔티티 교차검증이 강화됨.
  sameAs: ['https://github.com/yeojoonsoo02'],
};
