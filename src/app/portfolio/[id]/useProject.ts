'use client'

import { useEffect, useState } from 'react'
import type { Project } from '@/features/portfolio/portfolio.model'

interface UseProjectReturn {
  project: Project | null
  relatedProjects: Project[]
  loading: boolean
}

const RELATED_COUNT = 3

export function useProject(id: string | undefined, lang: string): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null)
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    const queryLang = lang || 'ko'

    fetch(`/api/portfolio?lang=${queryLang}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const items: Project[] = data.projects ?? []
        setAllProjects(items)
        setProject(items.find((p) => p.id === id) ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, lang])

  const relatedProjects = project
    ? allProjects
        .filter((p) => p.id !== project.id && p.category === project.category)
        .slice(0, RELATED_COUNT)
    : []

  return { project, relatedProjects, loading }
}
