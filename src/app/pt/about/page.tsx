import type { Metadata } from 'next';
import AboutContent from '../../about/AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'pt';
const URL = 'https://yeojoonsoo02.com/pt/about';

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — Sobre",
  description: "Sobre Yeojunsu, estudante desenvolvedor. Stack de tecnologia, certificações e contato.",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "Yeojunsu (여준수) — Sobre",
    description: "Sobre Yeojunsu, estudante desenvolvedor. Stack de tecnologia, certificações e contato.",
    url: URL,
    locale: 'pt_BR',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "Yeojunsu (여준수) — Sobre",
  description: "Sobre Yeojunsu, estudante desenvolvedor. Stack de tecnologia, certificações e contato.",
  inLanguage: 'pt-BR',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPagePt(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"Sou o Yeojunsu"} intro={"Estudante desenvolvedor. Minha trajetória e projetos estão aqui; o resto, pergunte à IA."} />
    </>
  );
}
