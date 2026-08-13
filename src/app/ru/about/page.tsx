import type { Metadata } from 'next';
import AboutContent from '../../about/AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'ru';
const URL = 'https://yeojoonsoo02.com/ru/about';

export const metadata: Metadata = {
  title: "Yeojunsu (여준수) — Обо мне",
  description: "О Yeojunsu, студенте-разработчике. Технологии, сертификаты и контакты.",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "Yeojunsu (여준수) — Обо мне",
    description: "О Yeojunsu, студенте-разработчике. Технологии, сертификаты и контакты.",
    url: URL,
    locale: 'ru_RU',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "Yeojunsu (여준수) — Обо мне",
  description: "О Yeojunsu, студенте-разработчике. Технологии, сертификаты и контакты.",
  inLanguage: 'ru-RU',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPageRu(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"Я Yeojunsu"} intro={"Студент-разработчик. Здесь мой путь и проекты — остальное спросите у ИИ."} />
    </>
  );
}
