import type { Metadata } from 'next';
import AboutContent from '../../about/AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'de';
const URL = 'https://yeojoonsoo02.com/de/about';

export const metadata: Metadata = {
  title: "Junsu Yeo (여준수) — Über mich",
  description: "Über Junsu Yeo, studentischer Entwickler. Tech-Stack, Zertifikate und Kontakt.",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "Junsu Yeo (여준수) — Über mich",
    description: "Über Junsu Yeo, studentischer Entwickler. Tech-Stack, Zertifikate und Kontakt.",
    url: URL,
    locale: 'de_DE',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "Junsu Yeo (여준수) — Über mich",
  description: "Über Junsu Yeo, studentischer Entwickler. Tech-Stack, Zertifikate und Kontakt.",
  inLanguage: 'de-DE',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPageDe(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"Ich bin Junsu Yeo"} intro={"Studentischer Entwickler. Werdegang und Projekte findest du hier — alles Weitere beantwortet die KI."} />
    </>
  );
}
