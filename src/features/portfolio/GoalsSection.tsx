'use client';

import { useTranslation } from 'react-i18next';
import type { GoalItem } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

export default function GoalsSection({ items }: { items: GoalItem[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <SectionWrapper id="goals" title={t('goalsVision')}>
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
    </SectionWrapper>
  );
}
