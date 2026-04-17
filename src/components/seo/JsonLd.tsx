const SITE_URL = 'https://yeojoonsoo02.com';

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: '여준수',
  alternateName: ['Yeo Joonsoo', 'Junsu Yeo', 'ヨ・ジュンス', '余俊秀', 'yeojoonsoo', 'yeojoonsoo02'],
  url: SITE_URL,
  image: `${SITE_URL}/profile.jpg`,
  email: 'mailto:yeojoonsoo02@gmail.com',
  jobTitle: '대학생 개발자 (Student Developer)',
  description:
    '대학생 개발자 여준수(Yeo Joonsoo). 프론트엔드 개발과 AI 연구에 관심을 두고 개인 프로젝트를 운영합니다.',
  knowsAbout: ['Frontend Development', 'TypeScript', 'React', 'Next.js', 'AI', '프론트엔드', '인공지능'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nowon-gu',
    addressRegion: 'Seoul',
    addressCountry: 'KR',
  },
  sameAs: [
    'https://yeojoonsoo02.com',
    'https://github.com/yeojoonsoo02',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '여준수 | 자기소개 사이트',
  alternateName: 'Yeo Joonsoo Personal Site',
  url: SITE_URL,
  inLanguage: ['ko-KR', 'en', 'ja-JP', 'zh-CN'],
  author: { '@type': 'Person', name: '여준수' },
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
