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
  const queryLang = lang || 'ko'
  const fromServer = queryLang === 'ko' && initial !== null
  // API로 받은 다른 언어판과, 받다가 실패한 언어. 어느 언어 것인지 함께 들고 있어야
  // 언어를 바꿨을 때 지난 요청의 결과·오류가 지금 화면에 섞이지 않는다.
  const [fetched, setFetched] = useState<{ lang: string; projects: Project[] } | null>(null)
  const [failedLang, setFailedLang] = useState<string | null>(null)
  // 한국어로 열었다가 언어를 바꾼 경우에만, 새 언어판이 올 때까지 한국어판을 그대로 둔다.
  // 처음부터 다른 언어였다면(다른 언어로 보던 사람이 넘어온 경우) 한국어판을 잠깐 보여주지 않는다.
  const [startedInKorean] = useState(queryLang === 'ko')

  useEffect(() => {
    if (fromServer) return
    let cancelled = false

    fetch(`/api/portfolio?lang=${encodeURIComponent(queryLang)}`)
      .then((r) => {
        // 429/5xx를 '프로젝트 없음'으로 오표시하지 않도록 일시 장애와 미존재를 구분한다.
        if (!r.ok) throw new Error(`portfolio fetch failed: ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (cancelled) return
        setFetched({ lang: queryLang, projects: data.projects ?? [] })
        setFailedLang(null)
      })
      .catch(() => {
        if (!cancelled) setFailedLang(queryLang)
      })

    return () => {
      cancelled = true
    }
  }, [queryLang, fromServer])

  const projects = fromServer ? initial : (fetched?.projects ?? (startedInKorean ? initial : null))
  const project = projects?.find((p) => p.id === id) ?? null

  // 카테고리가 사실상 전부 web이라 카테고리 매칭은 의미가 없다. 대표 프로젝트 우선, order 순.
  const relatedProjects = project
    ? [...(projects ?? [])]
        .filter((p) => p.id !== project.id)
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)
        .slice(0, RELATED_COUNT)
    : []

  // 보여줄 내용이 이미 있으면 다른 언어를 받는 중이거나 실패해도 그대로 둔다.
  const failed = !fromServer && failedLang === queryLang
  return {
    project,
    relatedProjects,
    loading: projects === null && !failed,
    error: projects === null && failed,
  }
}
