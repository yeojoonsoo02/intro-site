'use client';

import { useTranslation } from 'react-i18next';
import type { SkillCategory } from './portfolio.model';

export default function SkillsSection({ categories }: { categories: SkillCategory[] }) {
  const { t } = useTranslation();

  if (categories.length === 0) return null;

  return (
    <section className="mb-16 sm:mb-20">
      <h2
        className="text-sm font-bold tracking-wide mb-6"
        style={{ color: 'var(--muted)' }}
      >
        {t('skills')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h3
              className="text-base font-bold mb-3 pl-3"
              style={{
                color: 'var(--foreground)',
                borderLeft: '3px solid var(--primary)',
              }}
            >
              {cat.name}
            </h3>
            <div className="space-y-2">
              {cat.items.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    {skill.name}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background:
                            n <= skill.level
                              ? 'var(--primary)'
                              : 'color-mix(in srgb, var(--foreground) 12%, transparent)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
