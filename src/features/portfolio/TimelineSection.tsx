'use client';

import { useTranslation } from 'react-i18next';
import type { TimelineItem } from './portfolio.model';
import SectionWrapper from './SectionWrapper';
import { sortByOrder } from './projectUtils';

export default function TimelineSection({ items }: { items: TimelineItem[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  return (
    <SectionWrapper id="timeline" title={t('timeline')}>
      <ol className="m-0 p-0 list-none grid gap-6" style={{ borderLeft: '1px solid var(--rule)' }}>
        {sortByOrder(items).map((item) => (
          <li key={item.id} className="relative pl-6">
            <span
              aria-hidden="true"
              className="absolute -left-[5px] top-[9px] w-[9px] h-[9px] rounded-full"
              style={{ background: item.type === 'work' ? 'var(--accent)' : 'var(--paper)', border: '1.5px solid var(--accent)' }}
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
              <span className="text-[13px] tracking-[.02em] tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                {item.year}
              </span>
              <span className="text-[12.5px]" style={{ color: 'var(--muted)' }}>
                {t(`timelineType_${item.type}`)}
              </span>
            </div>
            <h3 className="text-[17px] font-semibold leading-snug mb-1" style={{ color: 'var(--ink)' }}>
              {item.title}
            </h3>
            {item.description && (
              <p className="text-[15px] leading-[1.65] max-w-[56ch]" style={{ color: 'var(--ink-2)' }}>
                {item.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </SectionWrapper>
  );
}
