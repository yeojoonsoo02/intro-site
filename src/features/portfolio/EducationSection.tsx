'use client';

import { useTranslation } from 'react-i18next';
import type { Education } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

export default function EducationSection({ items }: { items: Education[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <SectionWrapper id="education" title={t('educationSection')}>
      <div className="space-y-4">
        {sorted.map((edu) => (
          <div
            key={edu.id}
            className="px-5 py-4 rounded-xl"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
              <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                {edu.school}
              </h3>
              <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>
                {edu.period}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {edu.major}
              {edu.gpa && (
                <span
                  className="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    color: 'var(--primary)',
                  }}
                >
                  GPA {edu.gpa}
                </span>
              )}
            </p>
            {edu.description && (
              <p className="text-xs mt-2 break-keep" style={{ color: 'var(--muted)' }}>
                {edu.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
