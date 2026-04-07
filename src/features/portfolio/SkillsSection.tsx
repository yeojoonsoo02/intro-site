'use client';

import { useTranslation } from 'react-i18next';
import type { SkillCategory } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

function levelLabel(level: number, t: (key: string, options?: Record<string, string>) => string): { text: string; color: string; bg: string } {
  if (level >= 4) return { text: t('skillPrimary', { defaultValue: '주력' }), color: 'var(--primary)', bg: 'color-mix(in srgb, var(--primary) 10%, transparent)' };
  if (level >= 2) return { text: t('skillExperienced', { defaultValue: '경험' }), color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 10%, transparent)' };
  return { text: t('skillLearning', { defaultValue: '학습 중' }), color: 'var(--muted)', bg: 'color-mix(in srgb, var(--foreground) 6%, transparent)' };
}

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
              {cat.items.map((skill, idx) => {
                const badge = levelLabel(skill.level, t);
                return (
                  <span
                    key={`${cat.id}-${skill.name}-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                    style={{
                      background: badge.bg,
                      border: `1px solid color-mix(in srgb, ${badge.color} 20%, transparent)`,
                      color: 'var(--foreground)',
                    }}
                  >
                    {skill.name}
                    <span
                      className="text-[0.65rem] font-medium px-1.5 py-0.5 rounded"
                      style={{ color: badge.color, opacity: 0.8 }}
                    >
                      {badge.text}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
