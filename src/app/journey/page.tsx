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
      className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16"
      style={{ color: 'var(--foreground)' }}
    >
      <header className="mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          사진으로 지나온 시간
        </h1>
        <p
          className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed pl-4"
          style={{
            color: 'var(--muted)',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          어린 시절부터 지금까지의 기록을 한 자리에 모으는 중입니다.
          각 카드에는 시기별 사진과 짧은 설명이 채워집니다.
        </p>
      </header>

      <JourneyGallery />

      <footer
        className="mt-16 pt-6 text-sm"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Link href="/" className="underline-offset-4 hover:underline">
          ← 홈으로
        </Link>
      </footer>
    </main>
  );
}
