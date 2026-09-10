'use client';

import { useTranslation } from 'react-i18next';
import type { Project } from './portfolio.model';
import { statusKey } from './projectUtils';

/** 기술 태그 — 메타 정보라 mono, 바·아이콘 없음 */
export function StackTags({ tags, max }: { tags: string[]; max?: number }) {
  const shown = max ? tags.slice(0, max) : tags;
  const rest = max ? tags.length - shown.length : 0;
  if (shown.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 list-none p-0 m-0" aria-label="stack">
      {shown.map((tag) => (
        <li
          key={tag}
          className="text-[12.5px] tracking-[.02em]"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}
        >
          {tag}
        </li>
      ))}
      {rest > 0 && (
        <li className="text-[12.5px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          +{rest}
        </li>
      )}
    </ul>
  );
}

/** 상태 표시 — 색이 아니라 점+글자로 구분(색맹 대응). live만 강조색. */
export function StatusMark({ status }: { status: Project['status'] }) {
  const { t } = useTranslation();
  const key = statusKey(status);
  if (!key) return null;
  const live = status === 'live';
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[12.5px] tracking-[.02em]"
      style={{ fontFamily: 'var(--font-mono)', color: live ? 'var(--accent)' : 'var(--muted)' }}
    >
      <span
        aria-hidden="true"
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: live ? 'var(--accent)' : 'var(--muted)' }}
      />
      {t(key)}
    </span>
  );
}
