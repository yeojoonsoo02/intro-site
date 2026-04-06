'use client';

import { useTranslation } from 'react-i18next';
import type { RoutineStep } from './portfolio.model';
import useInView from './useInView';

export default function RoutineSection({ items }: { items: RoutineStep[] }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div
      id="routine"
      ref={ref}
      role="region"
      aria-label="daily routine"
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
        {t('dailyRoutine')}
      </h2>
      <div className="relative pl-6">
        <div
          className="absolute left-[7px] top-2 bottom-2 w-[2px]"
          style={{ background: 'var(--border)' }}
        />
        <div className="space-y-4">
          {sorted.map((step) => (
            <div key={step.id} className="relative">
              <div
                className="absolute -left-6 top-1 w-3 h-3 rounded-full"
                style={{ background: 'var(--primary)', opacity: 0.6 }}
              />
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{
                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    color: 'var(--primary)',
                  }}
                >
                  {step.time}
                </span>
                <span className="text-sm break-keep" style={{ color: 'var(--foreground)' }}>
                  {step.content}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
