'use client';

import { useTranslation } from 'react-i18next';
import type { HobbyCategory } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

const CAT_COLORS: Record<string, string> = {
  sports: 'var(--primary)',
  creative: '#22c55e',
  travel: '#f59e0b',
  mindful: 'var(--accent)',
  food: '#ef4444',
};

export default function HobbiesSection({ categories }: { categories: HobbyCategory[] }) {
  const { t } = useTranslation();
  if (categories.length === 0) return null;

  return (
    <SectionWrapper id="hobbies" title={t('hobbiesInterests')}>
      <div className="space-y-5">
        {categories.map((cat) => {
          const color = CAT_COLORS[cat.id] ?? 'var(--muted)';
          return (
            <div key={cat.id}>
              <h3
                className="text-xs font-bold mb-2.5 pl-3"
                style={{ color, borderLeft: `3px solid ${color}` }}
              >
                {cat.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{
                      background: `color-mix(in srgb, ${color} 8%, transparent)`,
                      color: 'var(--foreground)',
                      border: `1px solid color-mix(in srgb, ${color} 15%, transparent)`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
