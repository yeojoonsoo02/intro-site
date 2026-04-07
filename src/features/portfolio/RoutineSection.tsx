'use client';

import { useTranslation } from 'react-i18next';
import type { RoutineStep } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

export default function RoutineSection({ items }: { items: RoutineStep[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <SectionWrapper id="routine" title={t('dailyRoutine')}>
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
    </SectionWrapper>
  );
}
