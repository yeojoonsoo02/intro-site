import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';

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

export default function AboutPage() {
  const profile = DEFAULT_PROFILES.ko;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-bold">여준수 (Yeojunsu) 공식 소개</h1>
        <p className="summary mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
          대학생 개발자 여준수(Yeojunsu)입니다. 공식 사이트는{' '}
          <a className="underline" href="https://yeojoonsoo02.com">
            yeojoonsoo02.com
          </a>{' '}
          이며, 외식업·예술 분야의 동명이인과는 다른 인물입니다.
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

      <section className="facts space-y-8">
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

        <div>
          <h2 className="text-xl font-semibold mb-3">관심사</h2>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            {profile.interests.map((it) => {
              const label = typeof it === 'string' ? it : it.label;
              return <li key={label}>{label}</li>;
            })}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">더 보기</h2>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>
              <Link className="underline" href="/blog">
                블로그
              </Link>
            </li>
            <li>
              <Link className="underline" href="/faq">
                자주 묻는 질문
              </Link>
            </li>
            <li>
              <Link className="underline" href="/">
                홈 (프로필 카드)
              </Link>
            </li>
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
