'use client'

import { useEffect, useState } from 'react'
import type { Project } from '@/features/portfolio/portfolio.model'

interface UseProjectReturn {
  project: Project | null
  relatedProjects: Project[]
  loading: boolean
  error: boolean
}

const RELATED_COUNT = 3

// initial은 서버가 첫 HTML에 실어 보낸 한국어 프로젝트 목록이다(서버가 못 읽었으면 null).
// 한국어면 그대로 쓰고, 다른 언어일 때만 API로 그 언어판을 받는다.
export function useProject(id: string, lang: string, initial: Project[] | null): UseProjectReturn {
  // 다른 언어로 보고 있던 사람이 넘어온 경우엔 한국어판을 잠깐 보여주지 않고 그 언어판을 기다린다.
  const [projects, setProjects] = useState<Project[] | null>((lang || 'ko') === 'ko' ? initial : null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const queryLang = lang || 'ko'
    if (queryLang === 'ko' && initial) {
      setProjects(initial)
      setError(false)
      return
    }
    let cancelled = false
    setError(false)

    fetch(`/api/portfolio?lang=${encodeURIComponent(queryLang)}`)
      .then((r) => {
        // 429/5xx를 '프로젝트 없음'으로 오표시하지 않도록 일시 장애와 미존재를 구분한다.
        if (!r.ok) throw new Error(`portfolio fetch failed: ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setProjects(data.projects ?? [])
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [lang, initial])

  const project = projects?.find((p) => p.id === id) ?? null

  // 카테고리가 사실상 전부 web이라 카테고리 매칭은 의미가 없다. 대표 프로젝트 우선, order 순.
  const relatedProjects = project
    ? [...(projects ?? [])]
        .filter((p) => p.id !== project.id)
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)
        .slice(0, RELATED_COUNT)
    : []

  // 이미 보여줄 내용이 있으면(서버가 준 한국어판) 다른 언어를 받는 중이거나 실패해도 그대로 둔다.
  return {
    project,
    relatedProjects,
    loading: projects === null && !error,
    error: projects === null && error,
  }
}
