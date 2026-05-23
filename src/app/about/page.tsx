import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';
import { BLOG_POSTS } from '@/features/blog/posts';
import { safeJsonLd } from '@/lib/seo-utils';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  title: '여준수 (Yeojunsu) — 공식 소개 · About',
  description:
    '대학생 개발자 여준수(Yeojunsu)의 공식 소개 페이지. 기본 정보, 관심사, 연락처를 확인할 수 있습니다. 같은 이름의 다른 인물과는 무관합니다.',
  keywords: ['여준수', 'Yeojunsu', '여준수 소개', '여준수 프로필', '대학생 개발자'],
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    type: 'profile',
    title: '여준수 (Yeojunsu) 공식 소개',
    description: '대학생 개발자 여준수의 프로필과 연락처',
    url: `${SITE_URL}/about`,
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/about#aboutpage`,
  url: `${SITE_URL}/about`,
  name: '여준수 공식 소개',
  description: '대학생 개발자 여준수(Yeojunsu)의 공식 소개 페이지',
  inLanguage: 'ko-KR',
  mainEntity: { '@id': `${SITE_URL}#person` },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.summary', '.facts'],
  },
};

interface HubLink {
  href: string;
  title: string;
  label: string;
  desc: string;
}

const ALL_HUB_LINKS: HubLink[] = [
  {
    href: '/journey',
    title: 'Journey',
    label: '여정',
    desc: '어릴 때부터 지금까지, 사진으로 훑는 타임라인',
  },
  {
    href: '/portfolio',
    title: 'Portfolio',
    label: '포트폴리오',
    desc: '프로젝트와 활동 기록을 한곳에 모아둔 곳',
  },
  {
    href: '/blog',
    title: 'Blog',
    label: '블로그',
    desc: '배운 것, 겪은 것, 그냥 써두고 싶었던 것',
  },
  {
    href: '/faq',
    title: 'FAQ',
    label: '자주 묻는 질문',
    desc: '"이거 혹시…" 싶은 질문들, 미리 모아뒀습니다',
  },
];

export default function AboutPage() {
  const profile = DEFAULT_PROFILES.ko;
  const hubLinks = ALL_HUB_LINKS.filter(
    (it) => it.href !== '/blog' || BLOG_POSTS.length > 0,
  );

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />

      <header className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          여준수입니다
        </h1>
        <p
          className="summary mt-3 text-[0.95rem] sm:text-base leading-[1.7]"
          style={{ color: 'var(--muted)' }}
        >
          대학생 개발자입니다. 여정·프로젝트·자주 받는 질문을 모아뒀어요.
        </p>
      </header>

      {/* Hub cards — 이 페이지의 핵심 액션. fold 안에 두기 위해 헤더 직후로 끌어올림 */}
      <section className="mb-10 sm:mb-12" aria-label="더 파고들기">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">더 파고들기</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hubLinks.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="group relative block rounded-lg border p-4 transition-colors"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--card-bg)',
              }}
            >
              <p
                className="text-[0.7rem] uppercase tracking-[0.18em] mb-1.5"
                style={{ color: 'var(--muted)' }}
              >
                {it.title}
              </p>
              <p className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                {it.label}
                <span
                  aria-hidden="true"
                  className="inline-block text-xs transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ color: 'var(--muted)' }}
                >
                  →
                </span>
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--muted)' }}
              >
                {it.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="facts space-y-10">
        {(profile.motivation || profile.values?.length || profile.goal) && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3">왜 / 무엇을 / 어디로</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm leading-[1.7]">
              {profile.motivation && (
                <>
                  <dt style={{ color: 'var(--muted)' }}>왜</dt>
                  <dd>{profile.motivation}</dd>
                </>
              )}
              {profile.values && profile.values.length > 0 && (
                <>
                  <dt style={{ color: 'var(--muted)' }}>가치</dt>
                  <dd>{profile.values.join(' · ')}</dd>
                </>
              )}
              {profile.goal && (
                <>
                  <dt style={{ color: 'var(--muted)' }}>1~2년</dt>
                  <dd>{profile.goal}</dd>
                </>
              )}
            </dl>
          </div>
        )}

        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">한 줄 요약</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm leading-[1.7]">
            <dt style={{ color: 'var(--muted)' }}>이름</dt>
            <dd>여준수 (한글) / Yeojunsu (영문)</dd>
            <dt style={{ color: 'var(--muted)' }}>다른 표기</dt>
            <dd>ヨ・ジュンス · 余俊秀</dd>
            <dt style={{ color: 'var(--muted)' }}>직업</dt>
            <dd>{profile.tagline}</dd>
            <dt style={{ color: 'var(--muted)' }}>학력</dt>
            <dd>컴퓨터공학 · 소프트웨어 전공 · 3학년 재학</dd>
            <dt style={{ color: 'var(--muted)' }}>국적</dt>
            <dd>대한민국</dd>
            <dt style={{ color: 'var(--muted)' }}>이메일</dt>
            <dd>
              <a className="underline underline-offset-4" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </dd>
            <dt style={{ color: 'var(--muted)' }}>공식 사이트</dt>
            <dd>
              <a className="underline underline-offset-4" href="https://yeojoonsoo02.com">
                yeojoonsoo02.com
              </a>
            </dd>
            <dt style={{ color: 'var(--muted)' }}>GitHub</dt>
            <dd>
              <a className="underline underline-offset-4" href="https://github.com/yeojoonsoo02">
                github.com/yeojoonsoo02
              </a>
            </dd>
          </dl>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">
            요즘 빠져 있는 것들
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((it) => {
              const label = typeof it === 'string' ? it : it.label;
              return (
                <span
                  key={label}
                  className="rounded-full px-3 py-1 text-[0.82rem] font-medium tracking-tight border"
                  style={{
                    background: 'color-mix(in srgb, var(--foreground) 8%, transparent)',
                    color: 'color-mix(in srgb, var(--foreground) 75%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <nav className="mt-12 sm:mt-14 text-sm">
        <Link
          href="/"
          className="underline-offset-4 hover:underline"
          style={{ color: 'var(--muted)' }}
        >
          ← 처음으로 돌아가기
        </Link>
      </nav>
    </main>
  );
}
