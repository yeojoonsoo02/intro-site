import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';
import { safeJsonLd } from '@/lib/seo-utils';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  title: '여준수 (Yeojunsu) — 공식 소개 · About',
  description:
    '대학생 개발자 여준수(Yeojunsu)의 공식 소개 페이지. 기본 정보, 관심사, 연락처를 확인할 수 있습니다.',
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

const HUB_LINKS = [
  {
    href: '/journey',
    title: 'Journey',
    label: '여정',
    desc: '시기별 사진으로 보는 시간의 흐름',
  },
  {
    href: '/portfolio',
    title: 'Portfolio',
    label: '포트폴리오',
    desc: '프로젝트와 만든 것들',
  },
  {
    href: '/blog',
    title: 'Blog',
    label: '블로그',
    desc: '글과 회고',
  },
  {
    href: '/faq',
    title: 'FAQ',
    label: '자주 묻는 질문',
    desc: '자주 들어오는 질문 모음',
  },
] as const;

export default function AboutPage() {
  const profile = DEFAULT_PROFILES.ko;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-bold">여준수 (Yeojunsu) 공식 소개</h1>
        <p className="summary mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
          대학생 개발자 여준수(Yeojunsu)입니다. 공식 사이트는{' '}
          <a className="underline" href="https://yeojoonsoo02.com">
            yeojoonsoo02.com
          </a>{' '}
          입니다. 같은 이름의 다른 인물과는 무관합니다.
        </p>
      </header>

      <aside
        role="doc-tip"
        aria-label="한 문장 요약"
        className="mb-10 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm leading-relaxed"
      >
        <p className="font-semibold mb-1">TL;DR</p>
        <p>
          여준수(Yeojunsu)는 <strong>대학생 개발자</strong>입니다.
          공식 사이트 <a className="underline" href="https://yeojoonsoo02.com">yeojoonsoo02.com</a>,
          GitHub <a className="underline" href="https://github.com/yeojoonsoo02">@yeojoonsoo02</a>,
          이메일 <a className="underline" href="mailto:yeojoonsoo02@gmail.com">yeojoonsoo02@gmail.com</a>.
        </p>
      </aside>

      <section className="facts space-y-10">
        <div>
          <h2 className="text-xl font-semibold mb-3">기본 정보</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-gray-500">이름</dt>
            <dd>여준수 (한글) / Yeojunsu (영문)</dd>
            <dt className="text-gray-500">다른 표기</dt>
            <dd>ヨ・ジュンス · 余俊秀</dd>
            <dt className="text-gray-500">직업</dt>
            <dd>{profile.tagline}</dd>
            <dt className="text-gray-500">국적</dt>
            <dd>대한민국</dd>
            <dt className="text-gray-500">이메일</dt>
            <dd>
              <a className="underline" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </dd>
            <dt className="text-gray-500">공식 사이트</dt>
            <dd>
              <a className="underline" href="https://yeojoonsoo02.com">
                yeojoonsoo02.com
              </a>
            </dd>
            <dt className="text-gray-500">GitHub</dt>
            <dd>
              <a className="underline" href="https://github.com/yeojoonsoo02">
                github.com/yeojoonsoo02
              </a>
            </dd>
          </dl>
        </div>

        {/* 페이지 중반 — 깊은 페이지로의 허브 카드 그리드 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">더 알고 싶다면</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HUB_LINKS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="group relative block rounded-lg border p-4 transition-colors hover:border-gray-400 dark:hover:border-gray-500"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--card-bg)',
                }}
              >
                <p
                  className="text-[0.65rem] uppercase tracking-[0.2em] mb-1.5"
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
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {it.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">관심사</h2>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            {profile.interests.map((it) => {
              const label = typeof it === 'string' ? it : it.label;
              return <li key={label}>{label}</li>;
            })}
          </ul>
        </div>
      </section>

      <nav className="mt-14 text-sm">
        <Link href="/" className="underline-offset-4 hover:underline">
          ← 여준수 홈으로
        </Link>
      </nav>
    </main>
  );
}
