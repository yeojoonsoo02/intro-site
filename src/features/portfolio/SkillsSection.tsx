'use client';

import { useTranslation } from 'react-i18next';
import type { SkillCategory } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

export default function SkillsSection({ categories }: { categories: SkillCategory[] }) {
  const { t } = useTranslation();

  if (categories.length === 0) return null;

  return (
    <SectionWrapper id="skills" title={t('skills')} className="mb-10 sm:mb-14">
      <div className="space-y-6">
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
            <div className="flex flex-wrap gap-2">
              {cat.items.map((skill, idx) => (
                <span
                  key={`${cat.id}-${skill.name}-${idx}`}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
