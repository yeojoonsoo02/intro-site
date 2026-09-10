'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/features/portfolio/portfolio.model'
import { safeHttpsUrl } from '@/features/portfolio/safeUrl'
import { StackTags, StatusMark } from '@/features/portfolio/ProjectBits'
import { oneLiner } from '@/features/portfolio/projectUtils'

interface ProjectDetailProps {
  project: Project
  relatedProjects: Project[]
}

// 케이스 스터디: 문제 → 역할 → 결정 → 구현 포인트 → 결과 → 배운 점.
// 데이터가 없는 섹션은 그리지 않는다 — 빈 제목이 남으면 지어낸 것처럼 보인다.
export default function ProjectDetail({ project, relatedProjects }: ProjectDetailProps): JSX.Element {
  const { t } = useTranslation()
  const hasStory =
    Boolean(project.context || project.problem || project.role) ||
    (project.decisions?.length ?? 0) > 0 ||
    (project.highlights?.length ?? 0) > 0 ||
    (project.outcome?.length ?? 0) > 0 ||
    Boolean(project.lessons)

  return (
    <main style={{ background: 'var(--paper)' }}>
      <article className="max-w-[720px] mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-20">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-[14px] mb-10 underline-offset-4 hover:underline"
          style={{ color: 'var(--muted)' }}
        >
          <span aria-hidden="true">←</span> {t('viewAllProjects')}
        </Link>

        <Header project={project} />
        <Thumbnail project={project} />

        {hasStory ? (
          <div className="grid gap-12 sm:gap-14">
            <Prose id="context" title={t('context')} text={project.context} />
            <Prose id="problem" title={t('problem')} text={project.problem} />
            {/* 역할은 메타 표에 이미 있다. 한 줄이면 반복하지 않고, 서술이 길 때만 본문 섹션으로. */}
            <Prose id="role" title={t('role')} text={isLongRole(project.role) ? project.role : undefined} />
            <Decisions items={project.decisions} title={t('decisions')} />
            <Bullets id="highlights" title={t('highlights')} items={project.highlights} />
            <Bullets id="outcome" title={t('outcome')} items={project.outcome} emphasized />
            <Prose id="lessons" title={t('lessons')} text={project.lessons} />
          </div>
        ) : (
          // 케이스 스터디가 아직 없는 프로젝트: 설명만.
          <p className="text-[17px] leading-[1.75] max-w-[62ch]" style={{ color: 'var(--ink)' }}>
            {project.description}
          </p>
        )}

        <Related projects={relatedProjects} />
      </article>
    </main>
  )
}

function Header({ project }: { project: Project }): JSX.Element {
  const { t } = useTranslation()
  const live = safeHttpsUrl(project.liveUrl)
  const repo = safeHttpsUrl(project.repoUrl)
  const summary = oneLiner(project)
  const showDescription = project.summary && project.description && project.description.trim() !== project.summary.trim()

  return (
    <header className="mb-10 sm:mb-12">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-[12.5px] tracking-[.03em]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          {t('caseStudy')}
        </span>
        <StatusMark status={project.status} />
      </div>
      <h1
        className="text-[32px] sm:text-[40px] font-bold leading-[1.2] mb-4"
        style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)', textWrap: 'balance' }}
      >
        {project.title}
      </h1>
      <p className="text-[18px] leading-[1.7] max-w-[56ch] mb-8" style={{ color: 'var(--ink-2)' }}>
        {summary}
      </p>
      {showDescription && (
        <p className="text-[16px] leading-[1.75] max-w-[62ch] mb-8" style={{ color: 'var(--ink-2)' }}>
          {project.description}
        </p>
      )}

      <dl
        className="m-0 grid gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr] py-5 text-[15px]"
        style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}
      >
        {project.period && <Row label={t('period')}><span style={{ fontFamily: 'var(--font-mono)' }} className="text-[14px] tracking-[.02em]">{project.period}</span></Row>}
        {project.role && <Row label={t('role')}>{project.role}</Row>}
        {project.tags.length > 0 && <Row label={t('stack')}><StackTags tags={project.tags} /></Row>}
      </dl>

      {(live || repo) && (
        <div className="flex flex-wrap gap-3 mt-6">
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-[var(--r-md)] text-[15px] font-medium"
              style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
            >
              {t('viewLive')} <span aria-hidden="true" className="ml-1">↗</span>
            </a>
          )}
          {repo && (
            <a
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-[var(--r-md)] text-[15px] font-medium"
              style={{ border: '1px solid var(--rule)', color: 'var(--ink)' }}
            >
              {t('viewRepo')} <span aria-hidden="true" className="ml-1">↗</span>
            </a>
          )}
        </div>
      )}
    </header>
  )
}

function isLongRole(role?: string): boolean {
  return Boolean(role && (role.includes('\n') || role.length > 80))
}

function Row({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="contents">
      <dt className="text-[12.5px] tracking-[.03em] pt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
        {label}
      </dt>
      <dd className="m-0" style={{ color: 'var(--ink)' }}>{children}</dd>
    </div>
  )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }): JSX.Element {
  return (
    <h2
      id={`${id}-title`}
      className="text-[22px] font-semibold leading-tight mb-4"
      style={{ fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em', color: 'var(--ink)' }}
    >
      {children}
    </h2>
  )
}

function Prose({ id, title, text }: { id: string; title: string; text?: string }): JSX.Element | null {
  if (!text?.trim()) return null
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <SectionTitle id={id}>{title}</SectionTitle>
      <div className="grid gap-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[17px] leading-[1.75] max-w-[62ch]" style={{ color: 'var(--ink)' }}>
            {p}
          </p>
        ))}
      </div>
    </section>
  )
}

function Bullets({ id, title, items, emphasized = false }: { id: string; title: string; items?: string[]; emphasized?: boolean }): JSX.Element | null {
  const list = (items ?? []).map((s) => s.trim()).filter(Boolean)
  if (list.length === 0) return null
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <SectionTitle id={id}>{title}</SectionTitle>
      <ul className="m-0 p-0 list-none grid gap-3">
        {list.map((item, i) => (
          <li
            key={i}
            className="pl-4 text-[17px] leading-[1.7] max-w-[62ch]"
            style={{ borderLeft: emphasized ? '3px solid var(--accent)' : '1px solid var(--rule)', color: 'var(--ink)' }}
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Decisions({ items, title }: { items?: Project['decisions']; title: string }): JSX.Element | null {
  const list = (items ?? []).filter((d) => d.what?.trim() && d.why?.trim())
  if (list.length === 0) return null
  return (
    <section id="decisions" aria-labelledby="decisions-title">
      <SectionTitle id="decisions">{title}</SectionTitle>
      <dl className="m-0 grid gap-5">
        {list.map((d, i) => (
          <div key={i} className="grid gap-1">
            <dt className="text-[17px] font-semibold" style={{ color: 'var(--ink)' }}>{d.what}</dt>
            <dd className="m-0 text-[16px] leading-[1.7] max-w-[60ch]" style={{ color: 'var(--ink-2)' }}>{d.why}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Thumbnail({ project }: { project: Project }): JSX.Element | null {
  const thumbnail = safeHttpsUrl(project.thumbnail)
  if (!thumbnail) return null
  return (
    <div className="mb-12 rounded-[var(--r-lg)] overflow-hidden" style={{ border: '1px solid var(--rule)' }}>
      <Image
        src={thumbnail}
        alt={`${project.title} 화면`}
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, 720px"
        className="w-full h-auto"
        priority
        // 관리자가 넣는 임의 호스트라 옵티마이저(remotePatterns)를 거치면 실패한다. https만 허용해 직접 로드.
        unoptimized
      />
    </div>
  )
}

function Related({ projects }: { projects: Project[] }): JSX.Element | null {
  const { t } = useTranslation()
  if (projects.length === 0) return null
  return (
    <aside className="mt-16 pt-8" style={{ borderTop: '1px solid var(--rule)' }} aria-labelledby="related-title">
      <h2 id="related-title" className="text-[13px] font-medium tracking-[.03em] mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
        {t('recentProjects')}
      </h2>
      <ul className="m-0 p-0 list-none grid gap-3">
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/portfolio/${p.id}`} className="group block">
              <span className="text-[17px] font-semibold underline-offset-4 group-hover:underline" style={{ color: 'var(--ink)' }}>{p.title}</span>
              <span className="block text-[15px] leading-[1.6]" style={{ color: 'var(--ink-2)' }}>{oneLiner(p)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
