'use client';

import { useTranslation } from 'react-i18next';
import type { GoalItem } from './portfolio.model';
import useInView from './useInView';

export default function GoalsSection({ items }: { items: GoalItem[] }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div
      id="goals"
      ref={ref}
      role="region"
      aria-label="goals"
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
        {t('goalsVision')}
      </h2>
      <div className="space-y-3">
        {sorted.map((goal) => (
          <div
            key={goal.id}
            className="flex gap-3 items-start"
          >
            <span
              className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'var(--primary)' }}
            />
            <p className="text-sm leading-relaxed break-keep" style={{ color: 'var(--foreground)' }}>
              {goal.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
