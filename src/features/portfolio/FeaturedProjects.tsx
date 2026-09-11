'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { Project } from './portfolio.model';
import SectionWrapper from './SectionWrapper';
import { StackTags, StatusMark } from './ProjectBits';
import { oneLiner } from './projectUtils';

// 대표 프로젝트 4개. 첫 번째는 크게(5:3), 나머지 셋은 그 아래 나란히 — 큰 것 하나가 있어 균일 카드 나열로 읽히지 않는다.
export default function FeaturedProjects({ items }: { items: Project[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  const [lead, ...rest] = items;

  return (
    <SectionWrapper id="featured" title={t('featuredProjects')}>
      <div className="grid gap-4 sm:gap-5">
        <LeadCard project={lead} label={t('viewCaseStudy')} />
        {rest.length > 0 && (
          <div className={`grid gap-4 sm:gap-5 ${rest.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
            {rest.map((p) => (
              <SmallCard key={p.id} project={p} label={t('viewCaseStudy')} />
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

function LeadCard({ project, label }: { project: Project; label: string }) {
  return (
    <Link
      href={`/portfolio/${project.id}`}
      className="group block rounded-[var(--r-lg)] p-6 sm:p-8 transition-transform duration-200 hover:-translate-y-0.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--rule)', boxShadow: 'var(--shadow-1)' }}
    >
      <div className="grid gap-6 md:grid-cols-[5fr_3fr] md:gap-10">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <StatusMark status={project.status} />
            {project.period && (
              <span className="text-[12.5px] tracking-[.02em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
                {project.period}
              </span>
            )}
          </div>
          <h3
            className="text-[26px] sm:text-[30px] font-bold leading-[1.25] mb-3"
            style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
          >
            {project.title}
          </h3>
          <p className="text-[17px] leading-[1.7] max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
            {oneLiner(project)}
          </p>
        </div>
        <div className="flex flex-col justify-between gap-6 md:border-l md:pl-8" style={{ borderColor: 'var(--rule)' }}>
          {project.role && (
            <p className="text-[15px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>
              {project.role}
            </p>
          )}
          <StackTags tags={project.tags} max={6} />
          <span
            className="inline-flex items-center gap-1 text-[15px] font-medium underline underline-offset-4 decoration-1 group-hover:decoration-2"
            style={{ color: 'var(--accent)' }}
          >
            {label}
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function SmallCard({ project, label }: { project: Project; label: string }) {
  return (
    <Link
      href={`/portfolio/${project.id}`}
      className="group flex flex-col gap-4 rounded-[var(--r-lg)] p-5 sm:p-6 transition-transform duration-200 hover:-translate-y-0.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--rule)' }}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <StatusMark status={project.status} />
        {project.period && (
          <span className="text-[12.5px] tracking-[.02em] whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            {project.period}
          </span>
        )}
      </div>
      <h3
        className="text-[21px] font-bold leading-[1.3]"
        style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
      >
        {project.title}
      </h3>
      <p className="text-[15.5px] leading-[1.65] flex-1" style={{ color: 'var(--ink-2)' }}>
        {oneLiner(project)}
      </p>
      <StackTags tags={project.tags} max={4} />
      <span className="text-[14.5px] font-medium underline underline-offset-4 decoration-1 group-hover:decoration-2" style={{ color: 'var(--accent)' }}>
        {label} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
