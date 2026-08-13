import type { Metadata } from 'next';
import AboutContent from '../../about/AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'fr';
const URL = 'https://yeojoonsoo02.com/fr/about';

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — À propos",
  description: "À propos de Yeojunsu, étudiant développeur. Stack technique, certifications et contact.",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "Yeojunsu (여준수) — À propos",
    description: "À propos de Yeojunsu, étudiant développeur. Stack technique, certifications et contact.",
    url: URL,
    locale: 'fr_FR',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "Yeojunsu (여준수) — À propos",
  description: "À propos de Yeojunsu, étudiant développeur. Stack technique, certifications et contact.",
  inLanguage: 'fr-FR',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPageFr(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"Je suis Yeojunsu"} intro={"Étudiant développeur. Mon parcours et mes projets sont ici ; pour le reste, demandez à l’IA."} />
    </>
  );
}
