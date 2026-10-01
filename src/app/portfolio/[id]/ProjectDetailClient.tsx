'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/features/portfolio/portfolio.model'
import ProjectDetail from './ProjectDetail'
import { useProject } from './useProject'

interface ProjectDetailClientProps {
  id: string
  /** 서버가 읽은 한국어 프로젝트 목록. 서버가 Firestore를 못 읽었으면 null — 브라우저가 API로 받는다. */
  initialProjects: Project[] | null
}

// 로그인 게이트를 없앴다. 리뷰어는 20~90초를 쓰고 대부분 클릭조차 하지 않는다 —
// 케이스 스터디는 그 안에 읽혀야 하므로 문턱을 두지 않는다.
export default function ProjectDetailClient({ id, initialProjects }: ProjectDetailClientProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const { project, relatedProjects, loading, error } = useProject(id, i18n.language, initialProjects)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>{t('loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p style={{ color: 'var(--muted)' }}>{t('loadError')}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-[var(--r-md)] text-[15px] font-medium"
          style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
        >
          {t('retry')}
        </button>
        <Link href="/portfolio" className="text-[15px] underline underline-offset-4" style={{ color: 'var(--ink-2)' }}>
          {t('viewAllProjects')}
        </Link>
      </div>
    )
  }

  if (!project) return <ProjectMissing />

  return <ProjectDetail project={project} relatedProjects={relatedProjects} />
}

/** 없는 프로젝트 안내. 서버가 404를 확정했을 때(not-found.tsx)와 브라우저가 판정했을 때 같이 쓴다. */
export function ProjectMissing(): JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p style={{ color: 'var(--muted)' }}>{t('projectNotFound')}</p>
      <Link href="/portfolio" className="text-[15px] underline underline-offset-4" style={{ color: 'var(--accent)' }}>
        {t('viewAllProjects')}
      </Link>
    </div>
  )
}
