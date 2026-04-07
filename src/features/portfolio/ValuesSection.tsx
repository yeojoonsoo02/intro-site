'use client';

import { useTranslation } from 'react-i18next';
import type { ValueQuote } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

export default function ValuesSection({ items }: { items: ValueQuote[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <SectionWrapper id="values" title={t('valuesMindet')}>
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
    </SectionWrapper>
  );
}
