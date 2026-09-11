import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import LangInit from '@/lib/LangInit';
import { hreflangFor, langPath, langUrl, OG_LOCALE, type Lang } from '@/lib/site';
import { getLabels } from './about/labels';
import { getHomeData } from './homeData';
import AboutRecentPosts from './about/AboutRecentPosts';
import ChatCtaButton from '@/features/prompt/ChatCtaButton';
import SocialLinks from '@/features/social/SocialLinks';
import VisitorCount from '@/features/visitors/VisitorCount';
import { safeHttpsUrl } from '@/features/portfolio/safeUrl';
import type { Project } from '@/features/portfolio/portfolio.model';

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

// 첫 화면 문구. knowledge.ts·Firestore에 있는 사실만 옮긴 것이다 — 광운대 소프트웨어학과 재학,
// 웹·앱 외주 개발(챗코가)과 개인 서비스 운영. 찾는 것은 "협업·의뢰 문의"로만 적는다(취업 여부는 미확인).
interface HomeCopy {
  kicker: string;      // 소속
  identity: string;    // 무엇을 하는 사람인지 한 줄
  seeking: string;     // 무엇을 찾는지 / 어떻게 연락하는지
  featuredNote: string; // 대표 프로젝트 섹션 부제
  archiveLink: string; // 전체 프로젝트 링크
  siteGuide: string;   // 사이트 안내 nav 라벨
  photoAlt: string;
}

const HOME_COPY: Record<Lang, HomeCopy> = {
  ko: {
    kicker: '광운대학교 소프트웨어학과',
    identity: '필요한 걸 직접 만드는 대학생 개발자. 웹·앱 외주 개발(챗코가)과 개인 서비스를 운영합니다.',
    seeking: '협업·개발 의뢰는 이메일로 연락 주세요.',
    featuredNote: '실제로 쓰이고 있는 것 네 가지',
    archiveLink: '전체 프로젝트 보기',
    siteGuide: '사이트 안내',
    photoAlt: '여준수 프로필 사진',
  },
  en: {
    kicker: 'Dept. of Software, Kwangwoon University',
    identity: 'A student developer who builds what he needs. Runs a web/app freelance studio (Chatkoga) and personal services.',
    seeking: 'For collaboration or project requests, email me.',
    featuredNote: 'Four things in real use',
    archiveLink: 'All projects',
    siteGuide: 'Site guide',
    photoAlt: 'Photo of Junsu Yeo',
  },
  ja: {
    kicker: '光云大学校 ソフトウェア学科',
    identity: '必要なものを自分で作る大学生開発者。Web・アプリ受託開発（チャットコガ）と個人サービスを運営しています。',
    seeking: '協業・開発のご依頼はメールでご連絡ください。',
    featuredNote: '実際に使われているもの四つ',
    archiveLink: 'すべてのプロジェクト',
    siteGuide: 'サイト案内',
    photoAlt: 'ヨ・ジュンスの写真',
  },
  zh: {
    kicker: '光云大学 软件学系',
    identity: '亲手做出自己需要的东西的大学生开发者。运营网页/应用外包开发（ChatKoga）与个人服务。',
    seeking: '合作或开发委托请发邮件联系。',
    featuredNote: '正在实际使用的四个项目',
    archiveLink: '查看全部项目',
    siteGuide: '网站导航',
    photoAlt: '呂晙壽的照片',
  },
  es: {
    kicker: 'Dpto. de Software, Universidad Kwangwoon',
    identity: 'Estudiante desarrollador que construye lo que necesita. Desarrollo web/app freelance (Chatkoga) y servicios propios.',
    seeking: 'Para colaboraciones o encargos, escríbeme por correo.',
    featuredNote: 'Cuatro cosas en uso real',
    archiveLink: 'Todos los proyectos',
    siteGuide: 'Guía del sitio',
    photoAlt: 'Foto de Junsu Yeo',
  },
  fr: {
    kicker: 'Dépt. Logiciel, Université Kwangwoon',
    identity: 'Étudiant développeur qui construit ce dont il a besoin. Développement web/app en freelance (Chatkoga) et services personnels.',
    seeking: 'Pour une collaboration ou une commande, écrivez-moi par e-mail.',
    featuredNote: 'Quatre projets réellement utilisés',
    archiveLink: 'Tous les projets',
    siteGuide: 'Plan du site',
    photoAlt: 'Photo de Junsu Yeo',
  },
  de: {
    kicker: 'Fachbereich Software, Kwangwoon-Universität',
    identity: 'Studentischer Entwickler, der baut, was er braucht. Freiberufliche Web-/App-Entwicklung (Chatkoga) und eigene Dienste.',
    seeking: 'Für Zusammenarbeit oder Aufträge: E-Mail.',
    featuredNote: 'Vier Dinge im echten Einsatz',
    archiveLink: 'Alle Projekte',
    siteGuide: 'Seitenübersicht',
    photoAlt: 'Foto von Junsu Yeo',
  },
  pt: {
    kicker: 'Depto. de Software, Universidade Kwangwoon',
    identity: 'Estudante desenvolvedor que constrói o que precisa. Desenvolvimento web/app freelance (Chatkoga) e serviços próprios.',
    seeking: 'Para colaborações ou encomendas, envie um e-mail.',
    featuredNote: 'Quatro coisas em uso real',
    archiveLink: 'Todos os projetos',
    siteGuide: 'Guia do site',
    photoAlt: 'Foto de Junsu Yeo',
  },
  ru: {
    kicker: 'Факультет ПО, Университет Квангун',
    identity: 'Студент-разработчик, который делает то, что нужно ему самому. Фриланс веб/приложения (Chatkoga) и собственные сервисы.',
    seeking: 'По вопросам сотрудничества и заказов пишите на почту.',
    featuredNote: 'Четыре проекта в реальном использовании',
    archiveLink: 'Все проекты',
    siteGuide: 'Карта сайта',
    photoAlt: 'Фото Junsu Yeo',
  },
};

const STATUS_LABEL: Record<Lang, Record<NonNullable<Project['status']>, string>> = {
  ko: { live: '운영 중', private: '비공개', archived: '종료', wip: '개발 중' },
  en: { live: 'Live', private: 'Private', archived: 'Archived', wip: 'In progress' },
  ja: { live: '運用中', private: '非公開', archived: '終了', wip: '開発中' },
  zh: { live: '运营中', private: '非公开', archived: '已结束', wip: '开发中' },
  es: { live: 'En uso', private: 'Privado', archived: 'Archivado', wip: 'En curso' },
  fr: { live: 'En ligne', private: 'Privé', archived: 'Archivé', wip: 'En cours' },
  de: { live: 'Live', private: 'Privat', archived: 'Archiviert', wip: 'In Arbeit' },
  pt: { live: 'No ar', private: 'Privado', archived: 'Arquivado', wip: 'Em andamento' },
  ru: { live: 'Работает', private: 'Приватный', archived: 'Архив', wip: 'В разработке' },
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

const EMAIL = 'yeojoonsoo02@gmail.com';

export async function HomePage({ lang }: { lang: Lang }) {
  const [{ profile, featured }] = await Promise.all([getHomeData(lang)]);
  const t = getLabels(lang);
  const c = HOME_COPY[lang];
  const intro = (profile.intro ?? []).filter((line) => line && line.trim());

  return (
    <>
      {/* LangInit로 언어를 고정해 SSR↔CSR 언어 불일치를 없앤다 */}
      <LangInit lang={lang} />
      <main className="mx-auto max-w-2xl px-5 sm:px-6 pt-20 sm:pt-28 pb-16">
        {/* 1. 첫 화면 — 누구인지, 무엇을 만드는지, 무엇을 찾는지 */}
        <section className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-5 items-start">
          <div className="min-w-0">
            <p className="meta mb-3">{c.kicker}</p>
            <h1 className="font-serif text-[2.25rem] sm:text-[2.75rem] leading-[1.15]">
              {profile.name}
            </h1>
            <p className="mt-4 text-[1.0625rem] sm:text-lg leading-[1.7]" style={{ color: 'var(--ink-2)' }}>
              {c.identity}
            </p>
          </div>
          <Image
            src={profile.photo || '/profile.jpg'}
            alt={c.photoAlt}
            width={112}
            height={112}
            priority
            sizes="(min-width: 640px) 112px, 88px"
            className="w-[88px] h-[88px] sm:w-[112px] sm:h-[112px] object-cover shrink-0"
            style={{ borderRadius: 'var(--r-lg)', border: '1px solid var(--rule)' }}
          />

          {intro.length > 0 && (
            <div className="col-span-2 space-y-3 max-w-[62ch]">
              {intro.map((line, i) => (
                <p key={i} className="intro-p leading-[1.75]" style={{ color: 'var(--ink)' }}>
                  {line}
                </p>
              ))}
            </div>
          )}

          <div className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            {/* 이 사이트의 대표 기능은 AI 대화 — 첫 화면에서 유일한 강조 버튼 */}
            <ChatCtaButton label={t('chatInvite')} />
            <p className="text-[0.9375rem]" style={{ color: 'var(--ink-2)' }}>
              {c.seeking}{' '}
              <a href={`mailto:${EMAIL}`} className="link-u" style={{ color: 'var(--ink)' }}>
                {EMAIL}
              </a>
            </p>
          </div>
        </section>

        {/* 2. 대표 프로젝트 — 첫 번째를 크게(5:3), 나머지는 옆에 세로로 쌓는다(큰 카드가 그 높이를 받친다) */}
        {featured.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <SectionHead title={t('projects')} note={c.featuredNote} />
            <div className="grid grid-cols-1 sm:grid-cols-8 gap-x-6 gap-y-8">
              {featured.map((p, i) => (
                <FeaturedProject key={p.id} project={p} lang={lang} primary={i === 0} sideCount={featured.length - 1} />
              ))}
            </div>
            <p className="mt-8">
              <Link href={langPath('ko', 'portfolio')} className="link-u text-[0.9375rem]" style={{ color: 'var(--ink-2)' }}>
                {c.archiveLink} →
              </Link>
            </p>
          </section>
        )}

        {/* 3. 요즘 — 블로그 최근 글. 사이트가 멈춘 이력서로 읽히지 않게 */}
        <section className="mt-16 sm:mt-20">
          <AboutRecentPosts lang={lang} />
        </section>

        {/* 4. 연락 + 사이트 안내 */}
        <section className="mt-16 sm:mt-20">
          <SectionHead title={t('contact')} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <a href={`mailto:${EMAIL}`} className="link-u text-[1.0625rem]" style={{ color: 'var(--ink)' }}>
              {EMAIL}
            </a>
            <div className="-mt-3 sm:mt-0"><SocialLinks colored /></div>
          </div>
        </section>

        <footer className="mt-16 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ borderTop: '1px solid var(--rule)' }}>
          <SiteLinks lang={lang} label={c.siteGuide} />
          <VisitorCount />
        </footer>
      </main>
    </>
  );
}

function SectionHead({ title, note }: { title: string; note?: string }): JSX.Element {
  return (
    <div className="mb-6">
      <div className="rule mb-4" aria-hidden="true" />
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="font-serif text-[1.375rem] sm:text-2xl">{title}</h2>
        {note && <p className="meta">{note}</p>}
      </div>
    </div>
  );
}

function FeaturedProject({
  project,
  lang,
  primary,
  sideCount,
}: {
  project: Project;
  lang: Lang;
  primary: boolean;
  /** 옆에 쌓이는 작은 카드 수 — 큰 카드가 그만큼의 행을 차지한다 */
  sideCount: number;
}): JSX.Element {
  const live = safeHttpsUrl(project.liveUrl);
  const status = project.status ? STATUS_LABEL[lang][project.status] : null;
  const metaBits = [status, project.period].filter(Boolean);
  return (
    <article
      className={`flex flex-col min-w-0 ${primary ? 'sm:col-span-5 sm:[grid-row:span_var(--side-count)]' : 'sm:col-span-3'}`}
      style={{
        borderTop: `${primary ? 3 : 1}px solid ${primary ? 'var(--accent)' : 'var(--rule)'}`,
        paddingTop: '1rem',
        ...(primary ? ({ '--side-count': String(Math.max(sideCount, 1)) } as CSSProperties) : {}),
      }}
    >
      {metaBits.length > 0 && <p className="meta mb-2">{metaBits.join(' · ')}</p>}
      <h3 className={`font-serif ${primary ? 'text-2xl sm:text-[1.75rem]' : 'text-xl'} leading-snug`}>
        <Link href={`/portfolio/${project.id}`} className="hover:underline underline-offset-4">
          {project.title}
        </Link>
      </h3>
      <p className={`mt-3 ${primary ? 'text-[1.0625rem]' : 'text-base'} leading-[1.7]`} style={{ color: 'var(--ink-2)' }}>
        {project.summary || project.description}
      </p>
      {project.tags?.length > 0 && (
        <p className="meta mt-4">{project.tags.slice(0, primary ? 7 : 4).join(' · ')}</p>
      )}
      {live && (
        <p className="mt-2 meta">
          <a href={live} target="_blank" rel="noopener noreferrer" className="link-u" style={{ color: 'var(--ink-2)' }}>
            {new URL(live).hostname}
          </a>
        </p>
      )}
    </article>
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
    <nav aria-label={label}>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9375rem]">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="link-u" style={{ color: 'var(--ink-2)' }}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
