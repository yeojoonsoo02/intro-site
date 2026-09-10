'use client';

import { useTranslation } from 'react-i18next';
import type { GoalItem, ValueQuote } from './portfolio.model';
import SectionWrapper from './SectionWrapper';
import { sortByOrder } from './projectUtils';

// 가치관은 인용처럼(명조), 목표는 목록으로 — 같은 모양의 카드 두 벌을 피한다.
export default function ValuesGoalsSection({ values, goals }: { values: ValueQuote[]; goals: GoalItem[] }) {
  const { t } = useTranslation();
  if (values.length === 0 && goals.length === 0) return null;

  return (
    <SectionWrapper id="values" title={t('valuesMindset')}>
      <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:gap-12">
        {values.length > 0 && (
          <div className="grid gap-5">
            {sortByOrder(values).map((v) => (
              <blockquote
                key={v.id}
                className="m-0 pl-4 text-[17px] leading-[1.7]"
                style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', borderLeft: '3px solid var(--accent)', color: 'var(--ink)' }}
              >
                {v.content}
              </blockquote>
            ))}
          </div>
        )}
        {goals.length > 0 && (
          <div>
            <h3 className="text-[13px] font-medium tracking-[.03em] mb-3" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              {t('goalsVision')}
            </h3>
            <ol className="m-0 pl-5 grid gap-2 text-[15.5px] leading-[1.65]" style={{ color: 'var(--ink-2)' }}>
              {sortByOrder(goals).map((g) => (
                <li key={g.id}>{g.content}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
