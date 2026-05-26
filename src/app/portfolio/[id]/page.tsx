'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/AuthProvider'
import ProjectDetail from './ProjectDetail'
import { useProject } from './useProject'

export default function ProjectDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const { user, login, loading: authLoading } = useAuth()
  const { project, relatedProjects, loading } = useProject(id, i18n.language)

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>{t('loading')}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--muted)' }}>{t('loginToView')}</p>
        <button
          onClick={() => login()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'var(--primary)', color: 'var(--primary-contrast)' }}
        >
          {t('loginWithGoogle')}
        </button>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--muted)' }}>Project not found</p>
        <Link href="/portfolio" className="text-sm" style={{ color: 'var(--primary)' }}>
          {t('viewAllProjects')} &rarr;
        </Link>
      </div>
    )
  }

  return <ProjectDetail project={project} relatedProjects={relatedProjects} />
}
