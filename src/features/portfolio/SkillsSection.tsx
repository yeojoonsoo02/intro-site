'use client';

import { useTranslation } from 'react-i18next';
import type { SkillCategory } from './portfolio.model';
import SectionWrapper from './SectionWrapper';

// 카테고리별 목록. 숙련도 바·퍼센트는 두지 않는다(채용 쪽에서 일관되게 감점).
export default function SkillsSection({ categories }: { categories: SkillCategory[] }) {
  const { t } = useTranslation();
  if (categories.length === 0) return null;

  return (
    <SectionWrapper id="skills" title={t('skills')}>
      <dl className="m-0 grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-x-8 sm:gap-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="contents">
            <dt className="text-[13px] font-medium tracking-[.03em] pt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              {cat.name}
            </dt>
            <dd className="m-0 text-[16px] leading-[1.7]" style={{ color: 'var(--ink)' }}>
              {cat.items.map((s) => s.name).join(' · ')}
            </dd>
          </div>
        ))}
      </dl>
    </SectionWrapper>
  );
}
