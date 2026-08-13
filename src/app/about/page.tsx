import type { Metadata } from 'next';
import AboutContent from './AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'ko';
const URL = 'https://yeojoonsoo02.com/about';

export const metadata: Metadata = {
  title: "여준수 (Yeojunsu) — 공식 소개 · About",
  description: "대학생 개발자 여준수(Yeojunsu)의 공식 소개. 기술 스택, 자격증, 가치관, 연락처를 확인할 수 있습니다.",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "여준수 (Yeojunsu) — 공식 소개 · About",
    description: "대학생 개발자 여준수(Yeojunsu)의 공식 소개. 기술 스택, 자격증, 가치관, 연락처를 확인할 수 있습니다.",
    url: URL,
    locale: 'ko_KR',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "여준수 (Yeojunsu) — 공식 소개 · About",
  description: "대학생 개발자 여준수(Yeojunsu)의 공식 소개. 기술 스택, 자격증, 가치관, 연락처를 확인할 수 있습니다.",
  inLanguage: 'ko-KR',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPage(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"여준수입니다"} intro={"대학생 개발자입니다. 여정·프로젝트를 모아뒀고, 궁금한 건 AI에게 물어볼 수 있어요."} />
    </>
  );
}
