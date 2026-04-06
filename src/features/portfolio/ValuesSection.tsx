'use client';

import { useTranslation } from 'react-i18next';
import type { ValueQuote } from './portfolio.model';
import useInView from './useInView';

export default function ValuesSection({ items }: { items: ValueQuote[] }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div
      id="values"
      ref={ref}
      role="region"
      aria-label="values"
      className="mb-14 sm:mb-16 scroll-mt-24 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <h2
        className="text-sm font-bold tracking-wide mb-6"
        style={{ color: 'var(--muted)' }}
      >
        {t('valuesMindet')}
      </h2>
      <div className="space-y-4">
        {sorted.map((v) => (
          <blockquote
            key={v.id}
            className="pl-4 py-1"
            style={{ borderLeft: '3px solid var(--primary)' }}
          >
            <p className="text-sm leading-relaxed break-keep" style={{ color: 'var(--foreground)' }}>
              {v.content}
            </p>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
