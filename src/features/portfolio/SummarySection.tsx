'use client';

import { useTranslation } from 'react-i18next';
import type { PortfolioSummary } from './portfolio.model';
import useInView from './useInView';

export default function SummarySection({ data }: { data: PortfolioSummary | null }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  if (!data) return null;

  return (
    <section
      id="summary"
      ref={ref as React.RefObject<HTMLElement>}
      className="mb-14 sm:mb-16 scroll-mt-24 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <h2
        className="text-xs font-bold tracking-widest uppercase mb-5"
        style={{ color: 'var(--muted)' }}
      >
        {t('about')}
      </h2>

      <p
        className="text-base sm:text-lg leading-relaxed mb-8 break-keep pl-4"
        style={{
          color: 'var(--foreground)',
          borderLeft: '3px solid var(--accent)',
        }}
      >
        {data.bio}
      </p>

      {data.highlights.length > 0 && (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide">
          {data.highlights.map((h, i) => (
            <div
              key={h.label + i}
              className="flex-shrink-0 px-5 py-4 rounded-xl text-center"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                minWidth: 120,
              }}
            >
              <div
                className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1"
                style={{ color: 'var(--primary)' }}
              >
                {h.value}
              </div>
              <div
                className="text-xs font-medium break-keep"
                style={{ color: 'var(--muted)' }}
              >
                {h.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
