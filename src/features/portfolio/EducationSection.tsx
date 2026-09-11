'use client';

import { useTranslation } from 'react-i18next';
import type { Education } from './portfolio.model';
import SectionWrapper from './SectionWrapper';
import { sortByOrder } from './projectUtils';

// 학력만. 카드가 아니라 정의 목록 — 사실 몇 줄이라 상자가 필요 없다.
// 자격증은 2026-09에 화면에서 뺐다(챗봇 컨텍스트에는 남아 있다).
export default function EducationSection({ items }: { items: Education[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  return (
    <SectionWrapper id="education" title={t('educationSection')}>
      <dl className="m-0 grid gap-5 md:max-w-[36rem]">
        {sortByOrder(items).map((edu) => (
          <div key={edu.id} className="grid gap-1">
            <dt className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>
              {edu.school}
              {edu.major && <span className="font-normal" style={{ color: 'var(--ink-2)' }}> · {edu.major}</span>}
            </dt>
            <dd className="m-0 text-[13px] tracking-[.02em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              {edu.period}
            </dd>
            {edu.description && (
              <dd className="m-0 text-[15px] leading-[1.65] max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
                {edu.description}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </SectionWrapper>
  );
}
