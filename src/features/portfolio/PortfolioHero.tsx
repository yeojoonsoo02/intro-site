'use client';

import type { PortfolioHero as HeroType } from './portfolio.model';

export default function PortfolioHero({ data }: { data: HeroType | null }) {
  if (!data) return null;

  return (
    <section className="mb-16 sm:mb-20">
      <h1
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-4"
        style={{ color: 'var(--foreground)' }}
      >
        {data.headline}
      </h1>
      <p
        className="text-lg sm:text-xl leading-relaxed max-w-lg pl-4"
        style={{
          color: 'var(--muted)',
          borderLeft: '3px solid var(--accent)',
        }}
      >
        {data.subline}
      </p>
    </section>
  );
}
