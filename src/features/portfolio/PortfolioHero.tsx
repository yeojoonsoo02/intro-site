'use client';

import type { PortfolioHero as HeroType } from './portfolio.model';
import useInView from './useInView';

export default function PortfolioHero({ data }: { data: HeroType | null }) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  if (!data) return null;

  return (
    <div
      id="hero"
      ref={ref}
      role="region"
      aria-label="hero"
      className="mb-20 sm:mb-28 scroll-mt-16 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
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
    </div>
  );
}
