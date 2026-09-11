import type { Metadata } from 'next';
import AboutContent from './AboutContent';
import { safeJsonLd } from '@/lib/seo-utils';
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
    title: "여준수 (Junsu Yeo) — 공식 소개 · About",
    description: "대학생 개발자 여준수(Junsu Yeo)의 공식 소개. 기술 스택, 가치관, 연락처를 확인할 수 있습니다.",
    heading: "여준수입니다",
    intro: "대학생 개발자입니다. 여정·프로젝트를 모아뒀고, 궁금한 건 AI에게 물어볼 수 있어요.",
  },
  en: {
    title: "Junsu Yeo (여준수) — About",
    description: "About Junsu Yeo, a student developer. Tech stack, values and contact.",
    heading: "I'm Junsu Yeo",
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
    title: "Junsu Yeo (여준수) — Sobre mí",
    description: "Sobre Junsu Yeo, estudiante desarrollador. Stack tecnológico, valores y contacto.",
    heading: "Soy Junsu Yeo",
    intro: "Estudiante desarrollador. Aquí está mi trayectoria y mis proyectos; lo demás puedes preguntárselo a la IA.",
  },
  fr: {
    title: "Junsu Yeo (여준수) — À propos",
    description: "À propos de Junsu Yeo, étudiant développeur. Stack technique, valeurs et contact.",
    heading: "Je suis Junsu Yeo",
    intro: "Étudiant développeur. Mon parcours et mes projets sont ici ; pour le reste, demandez à l’IA.",
  },
  de: {
    title: "Junsu Yeo (여준수) — Über mich",
    description: "Über Junsu Yeo, studentischer Entwickler. Tech-Stack, Werte und Kontakt.",
    heading: "Ich bin Junsu Yeo",
    intro: "Studentischer Entwickler. Werdegang und Projekte findest du hier — alles Weitere beantwortet die KI.",
  },
  pt: {
    title: "Junsu Yeo (여준수) — Sobre",
    description: "Sobre Junsu Yeo, estudante desenvolvedor. Stack de tecnologia, valores e contato.",
    heading: "Sou o Junsu Yeo",
    intro: "Estudante desenvolvedor. Minha trajetória e projetos estão aqui; o resto, pergunte à IA.",
  },
  ru: {
    title: "Junsu Yeo (여준수) — Обо мне",
    description: "О Junsu Yeo, студенте-разработчике. Технологии, ценности и контакты.",
    heading: "Я Junsu Yeo",
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
