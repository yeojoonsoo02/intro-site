import type { Metadata } from 'next';
import AboutContent from '../../about/AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'en';
const URL = 'https://yeojoonsoo02.com/en/about';

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — About",
  description: "About Yeojunsu, a student developer. Tech stack, certifications, values and contact.",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "Yeojunsu (여준수) — About",
    description: "About Yeojunsu, a student developer. Tech stack, certifications, values and contact.",
    url: URL,
    locale: 'en_US',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "Yeojunsu (여준수) — About",
  description: "About Yeojunsu, a student developer. Tech stack, certifications, values and contact.",
  inLanguage: 'en-US',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPageEn(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"I'm Yeojunsu"} intro={"A student developer. Journey and projects are here — ask the AI anything else."} />
    </>
  );
}
