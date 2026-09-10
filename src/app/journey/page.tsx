import type { Metadata } from 'next';
import Link from 'next/link';
import JourneyGallery from '@/features/journey/JourneyGallery';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: '여준수 — 성장 기록 (Journey)',
  description: '유아기부터 현재까지, 여준수(Junsu Yeo)의 시기별 사진 기록.',
  alternates: { canonical: `${SITE_URL}/journey` },
  openGraph: {
    type: 'article',
    title: '여준수 — 성장 기록',
    description: '여준수의 시기별 사진 기록',
    url: `${SITE_URL}/journey`,
  },
};

export default function JourneyPage() {
  return (
    <main
      className="max-w-2xl md:max-w-3xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-16"
      style={{ color: 'var(--ink)' }}
    >
      <header className="mb-12 sm:mb-20">
        {/* 입장 시 stagger: eyebrow → 제목 → 본문 순서로 fade-up */}
        <p
          className="journey-fade-1 meta mb-4"
        >
          여정
        </p>
        <h1 className="journey-fade-2 font-serif text-[2.25rem] sm:text-[3rem] leading-[1.1]">
          시기별 사진.
        </h1>
        <p
          className="journey-fade-3 mt-6 max-w-md text-base leading-relaxed intro-p"
          style={{ color: 'var(--ink-2)' }}
        >
          어린 시절부터 지금까지의 사진을 시기별로 모았습니다.
        </p>
      </header>

      <JourneyGallery />

      <footer
        className="mt-20 pt-6 text-[0.9375rem] flex justify-between"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <Link href="/" className="link-u">
          ← 홈으로
        </Link>
        <Link href="/about" className="link-u">
          소개 →
        </Link>
      </footer>
    </main>
  );
}
