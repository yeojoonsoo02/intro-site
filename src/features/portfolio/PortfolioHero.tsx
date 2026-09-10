'use client';

import type { PortfolioHero as HeroType } from './portfolio.model';

export default function PortfolioHero({ data }: { data: HeroType | null }) {
  if (!data) return null;
  return (
    <header className="mb-16 sm:mb-20">
      <h1
        className="text-[32px] sm:text-[40px] md:text-[44px] font-bold leading-[1.2] mb-5"
        style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
      >
        {data.headline}
      </h1>
      {data.subline && (
        <p
          className="text-[17px] sm:text-[18px] leading-[1.7] max-w-[60ch] pl-4"
          style={{ color: 'var(--ink-2)', borderLeft: '3px solid var(--accent)' }}
        >
          {data.subline}
        </p>
      )}
    </header>
  );
}
