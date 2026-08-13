import type { Metadata } from 'next';
import AboutContent from '../../about/AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'es';
const URL = 'https://yeojoonsoo02.com/es/about';

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — Sobre mí",
  description: "Sobre Yeojunsu, estudiante desarrollador. Stack tecnológico, certificaciones y contacto.",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "Yeojunsu (여준수) — Sobre mí",
    description: "Sobre Yeojunsu, estudiante desarrollador. Stack tecnológico, certificaciones y contacto.",
    url: URL,
    locale: 'es_ES',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "Yeojunsu (여준수) — Sobre mí",
  description: "Sobre Yeojunsu, estudiante desarrollador. Stack tecnológico, certificaciones y contacto.",
  inLanguage: 'es-ES',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPageEs(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"Soy Yeojunsu"} intro={"Estudiante desarrollador. Aquí está mi trayectoria y mis proyectos; lo demás puedes preguntárselo a la IA."} />
    </>
  );
}
