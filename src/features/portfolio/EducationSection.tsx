'use client';

import { useTranslation } from 'react-i18next';
import type { Certification, Education } from './portfolio.model';
import SectionWrapper from './SectionWrapper';
import { sortByOrder } from './projectUtils';

// 학력과 자격을 한 블록에. 카드가 아니라 정의 목록 — 사실 몇 줄이라 상자가 필요 없다.
export default function EducationSection({ items, certifications }: { items: Education[]; certifications: Certification[] }) {
  const { t } = useTranslation();
  if (items.length === 0 && certifications.length === 0) return null;

  return (
    <SectionWrapper id="education" title={t('educationSection')}>
      <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:gap-12">
        {items.length > 0 && (
          <dl className="m-0 grid gap-5">
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
        )}
        {certifications.length > 0 && (
          <div>
            <h3 className="text-[13px] font-medium tracking-[.03em] mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              {t('certifications')}
            </h3>
            <ul className="m-0 p-0 list-none grid gap-2">
              {sortByOrder(certifications).map((c) => (
                <li key={c.id} className="text-[15.5px] leading-[1.6]" style={{ color: 'var(--ink)' }}>
                  {c.name}
                  {c.issuer && <span style={{ color: 'var(--muted)' }}> · {c.issuer}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
