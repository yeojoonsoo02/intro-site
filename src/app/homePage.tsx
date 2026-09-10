import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import LangInit from '@/lib/LangInit';
import { hreflangFor, langUrl, OG_LOCALE, type Lang } from '@/lib/site';

// 홈은 한국어 루트(/)와 8개 로케일(/{lang})이 같은 화면을 그린다.
// 언어별로 다른 건 메타데이터 문자열뿐이라 표 하나로 관리한다.
interface HomeMeta {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
}

const HOME_META: Record<Lang, HomeMeta> = {
  ko: {
    title: "여준수 (Junsu Yeo) — 대학생 개발자 자기소개",
    description: "여준수(Junsu Yeo) 공식 자기소개 사이트. 대학생 개발자의 프로필과 연락처를 확인할 수 있습니다.",
    keywords: ["여준수", "Junsu Yeo", "Yeojunsu", "yeojoonsoo02", "여준수 개발자", "여준수 프로필", "여준수 자기소개", "대학생 개발자", "呂晙壽", "ヨ・ジュンス"],
    ogTitle: "여준수 (Junsu Yeo) — 대학생 개발자 자기소개",
    ogDescription: "여준수(Junsu Yeo) 공식 자기소개 사이트. 대학생 개발자의 프로필과 연락처를 확인할 수 있습니다.",
  },
  en: {
    title: "Junsu Yeo — About · Profile",
    description: "Personal introduction site of Junsu Yeo, a university student developer. View his profile and contact information.",
    keywords: ["여준수", "Junsu Yeo", "yeojoonsoo02", "university student developer"],
    ogTitle: "Junsu Yeo — About",
    ogDescription: "University student developer Junsu Yeo — profile and contact",
  },
  ja: {
    title: "여준수 (ヨ・ジュンス) — 自己紹介・プロフィール",
    description: "大学生開発者 여준수（ヨ・ジュンス）の自己紹介サイトです。プロフィールと連絡先をご覧いただけます。",
    keywords: ["여준수", "ヨ・ジュンス", "Junsu Yeo", "大学生開発者"],
    ogTitle: "여준수 (ヨ・ジュンス) — 自己紹介",
    ogDescription: "大学生開発者 여준수のプロフィールと連絡先",
  },
  zh: {
    title: "여준수 (呂晙壽) — 个人介绍 · 简介",
    description: "大学生开发者 여준수（呂晙壽）的个人介绍网站。可以查看简介与联系方式。",
    keywords: ["여준수", "呂晙壽", "Junsu Yeo", "大学生开发者"],
    ogTitle: "여준수 (呂晙壽) — 个人介绍",
    ogDescription: "大学生开发者 여준수 的个人简介与联系方式",
  },
  es: {
    title: "Junsu Yeo (여준수) — Perfil y presentación",
    description: "Sitio personal de Junsu Yeo (여준수), estudiante desarrollador. Consulta el perfil y los datos de contacto.",
    keywords: ["Junsu Yeo", "여준수", "Estudiante desarrollador", "Desarrollador Frontend"],
    ogTitle: "Junsu Yeo (여준수) — Perfil",
    ogDescription: "Estudiante desarrollador · Perfil y contacto",
  },
  fr: {
    title: "Junsu Yeo (여준수) — Profil et présentation",
    description: "Site personnel de Junsu Yeo (여준수), étudiant développeur. Profil et coordonnées.",
    keywords: ["Junsu Yeo", "여준수", "Étudiant développeur", "Développeur Frontend"],
    ogTitle: "Junsu Yeo (여준수) — Profil",
    ogDescription: "Étudiant développeur · Profil et contact",
  },
  de: {
    title: "Junsu Yeo (여준수) — Profil und Vorstellung",
    description: "Persönliche Seite von Junsu Yeo (여준수), studentischer Entwickler. Profil und Kontaktdaten.",
    keywords: ["Junsu Yeo", "여준수", "Studentischer Entwickler", "Frontend-Entwickler"],
    ogTitle: "Junsu Yeo (여준수) — Profil",
    ogDescription: "Studentischer Entwickler · Profil und Kontakt",
  },
  pt: {
    title: "Junsu Yeo (여준수) — Perfil e apresentação",
    description: "Site pessoal de Junsu Yeo (여준수), estudante desenvolvedor. Perfil e informações de contato.",
    keywords: ["Junsu Yeo", "여준수", "Estudante desenvolvedor", "Desenvolvedor Frontend"],
    ogTitle: "Junsu Yeo (여준수) — Perfil",
    ogDescription: "Estudante desenvolvedor · Perfil e contato",
  },
  ru: {
    title: "Junsu Yeo (여준수) — Профиль и представление",
    description: "Персональный сайт Junsu Yeo (여준수), студента-разработчика. Профиль и контактная информация.",
    keywords: ["Junsu Yeo", "여준수", "Студент-разработчик", "Фронтенд-разработчик"],
    ogTitle: "Junsu Yeo (여준수) — Профиль",
    ogDescription: "Студент-разработчик · Профиль и контакты",
  },
};

export function buildHomeMetadata(lang: Lang): Metadata {
  const m = HOME_META[lang];
  return {
    title: m.title,
    description: m.description,
    keywords: m.keywords,
    openGraph: {
      title: m.ogTitle,
      description: m.ogDescription,
      locale: OG_LOCALE[lang],
      url: langUrl(lang),
    },
    alternates: { canonical: langUrl(lang), languages: hreflangFor() },
  };
}

// LangInit로 언어를 고정해 SSR↔CSR 언어 불일치를 없앤다.
export function HomePage({ lang }: { lang: Lang }) {
  return (
    <>
      <LangInit lang={lang} />
      <HomeClient />
    </>
  );
}
