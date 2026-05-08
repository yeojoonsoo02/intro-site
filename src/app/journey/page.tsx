import type { Metadata } from 'next';
import Link from 'next/link';
import JourneyGallery from '@/features/journey/JourneyGallery';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  title: '여준수 — 성장 기록 (Journey)',
  description: '유아기부터 현재까지, 여준수(Yeojunsu)의 시기별 사진 기록.',
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
      className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-20"
      style={{ color: 'var(--foreground)' }}
    >
      <header className="mb-16 sm:mb-24">
        <p
          className="text-[0.7rem] uppercase tracking-[0.3em] mb-4"
          style={{ color: 'var(--muted)' }}
        >
          Journey
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
          시기별 사진.
        </h1>
        <p
          className="mt-6 max-w-md text-sm sm:text-base leading-relaxed pl-4"
          style={{
            color: 'var(--muted)',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          어린 시절부터 지금까지의 사진을 시기별로 모았습니다.
        </p>
      </header>

      <JourneyGallery />

      <footer
        className="mt-24 pt-6 text-sm flex justify-between"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Link href="/" className="underline-offset-4 hover:underline">
          ← 홈으로
        </Link>
        <Link href="/about" className="underline-offset-4 hover:underline">
          소개 →
        </Link>
      </footer>
    </main>
  );
}
