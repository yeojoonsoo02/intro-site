import type { Metadata } from 'next';
import Link from 'next/link';
import LangInit from '@/lib/LangInit';
import { hreflangFor, langPath, langUrl, OG_LOCALE, type Lang } from '@/lib/site';
import { getLabels } from './about/labels';
import { OG_IMAGES } from '@/components/seo/ogMeta';
import { getHomeData } from './homeData';
import ChatCtaButton from '@/features/prompt/ChatCtaButton';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';
import { devProfileFor } from '@/features/profile/devProfiles';
import VisitorCount from '@/features/visitors/VisitorCount';

// 홈은 한국어 루트(/)와 8개 로케일(/{lang})이 같은 화면을 그린다.
// 언어별로 다른 건 메타데이터와 짧은 문구뿐이라 표 하나로 관리한다.
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
    description: "大学生开发者 여준수（呂晙壽）的个人介绍网站。可查看个人简介与联系方式。",
    keywords: ["여준수", "呂晙壽", "Junsu Yeo", "大学生开发者"],
    ogTitle: "여준수 (呂晙壽) — 个人介绍",
    ogDescription: "大学生开发者 여준수 的个人简介与联系方式",
  },
  es: {
    title: "Junsu Yeo (여준수) — Perfil y presentación",
    description: "Sitio de presentación de Junsu Yeo, estudiante desarrollador. Perfil y datos de contacto.",
    keywords: ["Junsu Yeo", "여준수", "Estudiante desarrollador", "Desarrollador Frontend"],
    ogTitle: "Junsu Yeo (여준수) — Perfil",
    ogDescription: "Estudiante desarrollador · Perfil y contacto",
  },
  fr: {
    title: "Junsu Yeo (여준수) — Profil et présentation",
    description: "Site de présentation de Junsu Yeo, étudiant développeur. Profil et coordonnées.",
    keywords: ["Junsu Yeo", "여준수", "Étudiant développeur", "Développeur Frontend"],
    ogTitle: "Junsu Yeo (여준수) — Profil",
    ogDescription: "Étudiant développeur · Profil et contact",
  },
  de: {
    title: "Junsu Yeo (여준수) — Profil und Vorstellung",
    description: "Vorstellungsseite von Junsu Yeo, studentischer Entwickler. Profil und Kontakt.",
    keywords: ["Junsu Yeo", "여준수", "Studentischer Entwickler", "Frontend-Entwickler"],
    ogTitle: "Junsu Yeo (여준수) — Profil",
    ogDescription: "Studentischer Entwickler · Profil und Kontakt",
  },
  pt: {
    title: "Junsu Yeo (여준수) — Perfil e apresentação",
    description: "Site de apresentação de Junsu Yeo, estudante desenvolvedor. Perfil e contato.",
    keywords: ["Junsu Yeo", "여준수", "Estudante desenvolvedor", "Desenvolvedor Frontend"],
    ogTitle: "Junsu Yeo (여준수) — Perfil",
    ogDescription: "Estudante desenvolvedor · Perfil e contato",
  },
  ru: {
    title: "Junsu Yeo (여준수) — Профиль и представление",
    description: "Сайт-представление Junsu Yeo, студента-разработчика. Профиль и контакты.",
    keywords: ["Junsu Yeo", "여준수", "Студент-разработчик", "Фронтенд-разработчик"],
    ogTitle: "Junsu Yeo (여준수) — Профиль",
    ogDescription: "Студент-разработчик · Профиль и контакты",
  },
};

// 사이트 안내 nav의 aria-label
const SITE_GUIDE: Record<Lang, string> = {
  ko: '사이트 안내',
  en: 'Site guide',
  ja: 'サイト案内',
  zh: '网站导航',
  es: 'Guía del sitio',
  fr: 'Plan du site',
  de: 'Seitenübersicht',
  pt: 'Guia do site',
  ru: 'Карта сайта',
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
      images: OG_IMAGES,
    },
    alternates: { canonical: langUrl(lang), languages: hreflangFor() },
  };
}

export async function HomePage({ lang }: { lang: Lang }) {
  const { profile } = await getHomeData(lang);
  const t = getLabels(lang);

  return (
    <>
      {/* LangInit로 언어를 고정해 SSR↔CSR 언어 불일치를 없앤다 */}
      <LangInit lang={lang} />
      <main className="theme-classic max-w-xl mx-auto px-4 pt-14 pb-4 sm:p-6 sm:pt-14 text-center sm:min-h-[calc(100dvh-3.5rem)] sm:flex sm:flex-col">
        {/* 회전 프로필 카드 — 가장자리를 좌우로 스와이프하면 뒷면(챗코가)으로 뒤집힌다 */}
        <div className="sm:flex-1 sm:flex sm:flex-col sm:justify-center">
          <FlippableProfileCard profile={profile} devProfile={devProfileFor(lang)} />
        </div>

        {/* 이 사이트의 대표 기능은 AI 대화 — 첫 화면에 상시 노출되는 진입점 */}
        <div className="mt-5 flex justify-center">
          <ChatCtaButton label={t('chatInvite')} className="!rounded-full" />
        </div>

        {/* 더 알고 싶은 사람을 소개 페이지로 */}
        <div className="mt-3 flex justify-center">
          <Link
            href={langPath(lang, 'about')}
            className="group inline-flex items-center gap-2 py-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--foreground)' }}
          >
            <span>{t('readMore')}</span>
            <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
            <span className="sr-only">{t('about')}</span>
          </Link>
        </div>

        <div className="pb-4 sm:pb-8 mt-8">
          <VisitorCount />
        </div>
      </main>
      <SiteLinks lang={lang} label={SITE_GUIDE[lang]} />
    </>
  );
}

/**
 * 하위 페이지로 가는 크롤 가능한 링크. 서버 HTML에 있어야 /journey·/portfolio가 색인된다
 * (사이트맵만으로는 7주간 재수집되지 않았던 이력). 여정·포트폴리오는 한국어 경로만 있다.
 */
function SiteLinks({ lang, label }: { lang: Lang; label: string }): JSX.Element {
  const t = getLabels(lang);
  const links = [
    { href: langPath(lang, 'about'), label: t('about') },
    { href: '/journey', label: t('journey') },
    { href: '/portfolio', label: t('portfolio') },
    { href: 'https://blog.yeojoonsoo02.com', label: 'Blog' },
  ];
  return (
    <nav aria-label={label} className="mx-auto max-w-xl px-4 pb-10 text-center">
      <ul className="flex flex-wrap items-center justify-center gap-x-5 -my-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="link-u inline-block py-2.5" style={{ color: 'var(--muted)' }}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
