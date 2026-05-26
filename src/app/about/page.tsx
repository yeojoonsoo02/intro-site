import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';
import { safeJsonLd } from '@/lib/seo-utils';
import AboutHubCards from './AboutHubCards';
import AboutFacts from './AboutFacts';
import AboutInterests from './AboutInterests';

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

export default function AboutPage(): JSX.Element {
  const profile = DEFAULT_PROFILES.ko;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutPageSchema) }}
      />

      <header className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">여준수입니다</h1>
        <p
          className="summary mt-3 text-[0.95rem] sm:text-base leading-[1.7]"
          style={{ color: 'var(--muted)' }}
        >
          대학생 개발자입니다. 여정·프로젝트·자주 받는 질문을 모아뒀어요.
        </p>
      </header>

      <AboutHubCards />

      <section className="facts space-y-10">
        <AboutFacts profile={profile} />
        <AboutInterests interests={profile.interests} />
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
