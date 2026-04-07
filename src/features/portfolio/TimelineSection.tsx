'use client';

import { useTranslation } from 'react-i18next';
import type { TimelineItem } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

const TYPE_COLORS: Record<string, string> = {
  work: 'var(--primary)',
  education: 'var(--accent)',
  project: '#22c55e',
  etc: 'var(--muted)',
};

export default function TimelineSection({ items }: { items: TimelineItem[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <SectionWrapper id="timeline" title={t('timeline')} className="mb-20 sm:mb-24">
      <div className="relative pl-6">
        {/* 세로선 */}
        <div
          className="absolute left-[7px] top-2 bottom-2 w-[2px]"
          style={{ background: 'var(--border)' }}
        />

        <div className="space-y-6">
          {sorted.map((item) => (
            <div key={item.id} className="relative">
              {/* 도트 */}
              <div
                className="absolute -left-6 top-1.5 w-[14px] h-[14px] rounded-full border-2"
                style={{
                  borderColor: TYPE_COLORS[item.type] ?? 'var(--muted)',
                  background: 'var(--background)',
                }}
              />
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{
                    background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
                    color: 'var(--muted)',
                  }}
                >
                  {item.year}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    color: TYPE_COLORS[item.type] ?? 'var(--muted)',
                  }}
                >
                  {t(item.type)}
                </span>
              </div>
              <h3
                className="text-base font-bold mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                {item.title}
              </h3>
              {item.description && (
                <p className="text-sm break-keep" style={{ color: 'var(--muted)' }}>
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
