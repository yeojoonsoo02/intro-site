'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { Project } from './portfolio.model';
import SectionWrapper from './SectionWrapper';
import { StackTags, StatusMark } from './ProjectBits';
import { oneLiner } from './projectUtils';
import { safeHttpsUrl } from './safeUrl';

// 대표가 아닌 프로젝트는 컴팩트한 행으로. 리뷰어는 1~2개만 깊게 보므로 나머지는 훑기 좋게.
export default function ProjectArchive({ items }: { items: Project[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;

  return (
    <SectionWrapper id="archive" title={t('archive')}>
      <ul className="list-none m-0 p-0" style={{ borderTop: '1px solid var(--rule)' }}>
        {items.map((p) => {
          const live = safeHttpsUrl(p.liveUrl);
          const repo = safeHttpsUrl(p.repoUrl);
          return (
            <li key={p.id} className="py-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6" style={{ borderBottom: '1px solid var(--rule)' }}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                  <Link
                    href={`/portfolio/${p.id}`}
                    className="text-[17px] font-semibold underline-offset-4 hover:underline"
                    style={{ color: 'var(--ink)' }}
                  >
                    {p.title}
                  </Link>
                  <StatusMark status={p.status} />
                </div>
                <p className="text-[15px] leading-[1.6] mb-2 max-w-[60ch]" style={{ color: 'var(--ink-2)' }}>
                  {oneLiner(p)}
                </p>
                <StackTags tags={p.tags} max={5} />
              </div>
              {(live || repo) && (
                <div className="flex sm:flex-col gap-3 sm:items-end text-[13.5px] shrink-0">
                  {live && (
                    <a href={live} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: 'var(--accent)' }}>
                      {t('viewLive')}
                    </a>
                  )}
                  {repo && (
                    <a href={repo} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4" style={{ color: 'var(--ink-2)' }}>
                      {t('viewRepo')}
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </SectionWrapper>
  );
}
