import type { Metadata } from 'next';
import AboutContent from '../../about/AboutContent';
import { buildAboutHreflang, safeJsonLd } from '@/lib/seo-utils';

const LANG = 'zh';
const URL = 'https://yeojoonsoo02.com/zh/about';

export const metadata: Metadata = {
  title: "呂晙壽 (여준수) — 个人介绍",
  description: "大学生开发者呂晙壽的个人介绍。技术栈、资格证、价值观与联系方式。",
  alternates: { canonical: URL, languages: buildAboutHreflang() },
  openGraph: {
    type: 'profile',
    title: "呂晙壽 (여준수) — 个人介绍",
    description: "大学生开发者呂晙壽的个人介绍。技术栈、资格证、价值观与联系方式。",
    url: URL,
    locale: 'zh_CN',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#aboutpage`,
  url: URL,
  name: "呂晙壽 (여준수) — 个人介绍",
  description: "大学生开发者呂晙壽的个人介绍。技术栈、资格证、价值观与联系方式。",
  inLanguage: 'zh-CN',
  mainEntity: { '@id': 'https://yeojoonsoo02.com#person' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

export default function AboutPageZh(): JSX.Element {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />
      <AboutContent lang={LANG} heading={"我是呂晙壽"} intro={"大学生开发者。这里有我的经历与项目，其他问题可以问AI。"} />
    </>
  );
}
