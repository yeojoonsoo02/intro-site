'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import ProjectDetail from './ProjectDetail'
import { useProject } from './useProject'

// 로그인 게이트를 없앴다. 리뷰어는 20~90초를 쓰고 대부분 클릭조차 하지 않는다 —
// 케이스 스터디는 그 안에 읽혀야 하므로 문턱을 두지 않는다.
export default function ProjectDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const { project, relatedProjects, loading, error } = useProject(id, i18n.language)

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

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p style={{ color: 'var(--muted)' }}>{t('projectNotFound')}</p>
        <Link href="/portfolio" className="text-[15px] underline underline-offset-4" style={{ color: 'var(--accent)' }}>
          {t('viewAllProjects')}
        </Link>
      </div>
    )
  }

  return <ProjectDetail project={project} relatedProjects={relatedProjects} />
}
