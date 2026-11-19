import type { Metadata } from 'next';
import AboutContent from './AboutContent';
import { safeJsonLd } from '@/lib/seo-utils';
import { OG_IMAGES } from '@/components/seo/ogMeta';
import { BCP47, hreflangFor, langUrl, OG_LOCALE, SITE_URL, type Lang } from '@/lib/site';

// /about은 9개 언어 전부 있다. 본문(AboutContent)은 공유하고 언어별로 다른 건
// 제목·설명·인사말뿐이라 표 하나로 관리한다.
interface AboutMeta {
  title: string;
  description: string;
  heading: string;
  intro: string;
}

const ABOUT_META: Record<Lang, AboutMeta> = {
  ko: {
    title: "여준수 (Yeo Junsu) — 공식 소개 · About",
    description: "대학생 개발자 여준수(Yeo Junsu)의 공식 소개. 기술 스택, 가치관, 연락처를 확인할 수 있습니다.",
    heading: "여준수입니다",
    intro: "대학생 개발자입니다. 여정·프로젝트를 모아뒀고, 궁금한 건 AI에게 물어볼 수 있어요.",
  },
  en: {
    title: "Yeo Junsu (여준수) — About",
    description: "About Yeo Junsu, a student developer. Tech stack, values and contact.",
    heading: "I'm Yeo Junsu",
    intro: "A student developer. Journey and projects are here — ask the AI anything else.",
  },
  ja: {
    title: "ヨ・ジュンス (여준수) — 紹介",
    description: "大学生エンジニア、ヨ・ジュンスの紹介。技術スタック・価値観・連絡先。",
    heading: "ヨ・ジュンスです",
    intro: "大学生エンジニアです。歩みとプロジェクトをまとめました。気になることはAIに聞いてください。",
  },
  zh: {
    title: "呂晙壽 (여준수) — 个人介绍",
    description: "大学生开发者呂晙壽的个人介绍。技术栈、价值观与联系方式。",
    heading: "我是呂晙壽",
    intro: "大学生开发者。这里有我的经历与项目，其他问题可以问AI。",
  },
  es: {
    title: "Yeo Junsu (여준수) — Sobre mí",
    description: "Sobre Yeo Junsu, estudiante desarrollador. Stack tecnológico, valores y contacto.",
    heading: "Soy Yeo Junsu",
    intro: "Estudiante desarrollador. Aquí está mi trayectoria y mis proyectos; lo demás puedes preguntárselo a la IA.",
  },
  fr: {
    title: "Yeo Junsu (여준수) — À propos",
    description: "À propos de Yeo Junsu, étudiant développeur. Stack technique, valeurs et contact.",
    heading: "Je suis Yeo Junsu",
    intro: "Étudiant développeur. Mon parcours et mes projets sont ici ; pour le reste, demandez à l’IA.",
  },
  de: {
    title: "Yeo Junsu (여준수) — Über mich",
    description: "Über Yeo Junsu, studentischer Entwickler. Tech-Stack, Werte und Kontakt.",
    heading: "Ich bin Yeo Junsu",
    intro: "Studentischer Entwickler. Werdegang und Projekte findest du hier — alles Weitere beantwortet die KI.",
  },
  pt: {
    title: "Yeo Junsu (여준수) — Sobre",
    description: "Sobre Yeo Junsu, estudante desenvolvedor. Stack de tecnologia, valores e contato.",
    heading: "Sou o Yeo Junsu",
    intro: "Estudante desenvolvedor. Minha trajetória e projetos estão aqui; o resto, pergunte à IA.",
  },
  ru: {
    title: "Yeo Junsu (여준수) — Обо мне",
    description: "О Yeo Junsu, студенте-разработчике. Технологии, ценности и контакты.",
    heading: "Я Yeo Junsu",
    intro: "Студент-разработчик. Здесь мой путь и проекты — остальное спросите у ИИ.",
  },
};

export function buildAboutMetadata(lang: Lang): Metadata {
  const m = ABOUT_META[lang];
  const url = langUrl(lang, 'about');
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: url, languages: hreflangFor('about') },
    openGraph: {
      type: 'profile',
      title: m.title,
      description: m.description,
      url,
      locale: OG_LOCALE[lang],
      images: OG_IMAGES,
    },
  };
}

export function AboutPage({ lang }: { lang: Lang }): JSX.Element {
  const m = ABOUT_META[lang];
  const url = langUrl(lang, 'about');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${url}#aboutpage`,
    url,
    name: m.title,
    description: m.description,
    inLanguage: BCP47[lang],
    mainEntity: { '@id': `${SITE_URL}#person` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.summary', '.facts'],
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
      <AboutContent lang={lang} heading={m.heading} intro={m.intro} />
    </>
  );
}
