'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/features/portfolio/portfolio.model'

interface ProjectDetailProps {
  project: Project
  relatedProjects: Project[]
}

export default function ProjectDetail({
  project,
  relatedProjects,
}: ProjectDetailProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <main style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-20">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-xs mb-8 transition-opacity hover:opacity-70"
          style={{ color: 'var(--muted)' }}
        >
          &larr; {t('viewAllProjects')}
        </Link>

        <ProjectHeader project={project} />
        <ProjectActions project={project} />
        <ProjectTechStack tags={project.tags} />
        <ProjectThumbnail project={project} />
        <RelatedProjects projects={relatedProjects} />
      </div>
    </main>
  )
}

function ProjectHeader({ project }: { project: Project }): JSX.Element {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {project.title}
        </h1>
        {project.featured && (
          <span
            className="text-xs px-2 py-1 rounded shrink-0"
            style={{
              background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
              color: 'var(--primary)',
            }}
          >
            Featured
          </span>
        )}
      </div>
      <p
        className="text-base leading-relaxed break-keep"
        style={{ color: 'var(--muted)' }}
      >
        {project.description}
      </p>
    </div>
  )
}

function ProjectActions({ project }: { project: Project }): JSX.Element | null {
  const { t } = useTranslation()
  if (!project.liveUrl && !project.repoUrl) return null
  return (
    <div className="flex gap-3 mb-8">
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'var(--primary)', color: 'var(--primary-contrast)' }}
        >
          {t('viewLive')} &rarr;
        </a>
      )}
      {project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            background: 'color-mix(in srgb, var(--foreground) 8%, transparent)',
            color: 'var(--foreground)',
          }}
        >
          {t('viewRepo')} &rarr;
        </a>
      )}
    </div>
  )
}

function ProjectTechStack({ tags }: { tags: string[] }): JSX.Element | null {
  const { t } = useTranslation()
  if (tags.length === 0) return null
  return (
    <div className="mb-10">
      <h2
        className="text-sm font-bold tracking-wide mb-3"
        style={{ color: 'var(--muted)' }}
      >
        {t('techStack')}
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{
              background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
              color: 'var(--primary)',
              border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function ProjectThumbnail({ project }: { project: Project }): JSX.Element | null {
  if (!project.thumbnail) return null
  return (
    <div
      className="mb-10 rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      <Image
        src={project.thumbnail}
        alt={`${project.title} 프로젝트 메인 이미지`}
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, 768px"
        className="w-full h-auto"
        priority
      />
    </div>
  )
}

function RelatedProjects({ projects }: { projects: Project[] }): JSX.Element | null {
  const { t } = useTranslation()
  if (projects.length === 0) return null
  return (
    <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
      <h2
        className="text-sm font-bold tracking-wide mb-4"
        style={{ color: 'var(--muted)' }}
      >
        {t('recentProjects')}
      </h2>
      <div className="space-y-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/portfolio/${p.id}`}
            className="block px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              {p.title}
            </span>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
              {p.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
