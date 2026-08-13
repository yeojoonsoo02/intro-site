import type { Metadata } from 'next';
import AboutContent from '../../about/AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'ja';
const URL = 'https://yeojoonsoo02.com/ja/about';

export const metadata: Metadata = {
  title: "ヨ・ジュンス (여준수) — 紹介",
  description: "大学生エンジニア、ヨ・ジュンスの紹介。技術スタック・資格・価値観・連絡先。",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "ヨ・ジュンス (여준수) — 紹介",
    description: "大学生エンジニア、ヨ・ジュンスの紹介。技術スタック・資格・価値観・連絡先。",
    url: URL,
    locale: 'ja_JP',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "ヨ・ジュンス (여준수) — 紹介",
  description: "大学生エンジニア、ヨ・ジュンスの紹介。技術スタック・資格・価値観・連絡先。",
  inLanguage: 'ja-JP',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPageJa(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"ヨ・ジュンスです"} intro={"大学生エンジニアです。歩みとプロジェクトをまとめました。気になることはAIに聞いてください。"} />
    </>
  );
}
