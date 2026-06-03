import { KNOWLEDGE } from '@/data/knowledge'

export type Chunk = { id: string; text: string }

// KNOWLEDGE의 실제 섹션과 매핑. 새 섹션을 추가하면 여기에도 동기화 필요.
// 매핑이 없는 섹션은 splitKnowledge가 제목 슬러그를 자동 생성함.
const ID_MAP: Record<string, string> = {
  '기본 정보': 'basic',
  '학력': 'education',
  '관심사': 'interests',
  '가치관과 마인드셋': 'values',
  '꿈과 목표': 'goals',
  '소개': 'intro',
  // 콘텐츠 보강 시 사용할 섹션 — knowledge.ts에 해당 제목을 추가하면 안정적 ID로 매핑됨.
  // 매핑이 있어야 RAG 검색·임베딩 캐시가 슬러그 변동 없이 일관되게 동작.
  '기술 스택': 'skills',
  '프로젝트': 'projects',
  '경력': 'experience',
  '수상 및 성과': 'awards',
  '자격증': 'certifications',
  '연락 및 협업': 'contact',
}

let cached: Chunk[] | null = null

export function splitKnowledge(): Chunk[] {
  if (cached) return cached

  const sections = KNOWLEDGE.trim().split(/^# /m).filter(Boolean)
  const chunks: Chunk[] = sections.map((section) => {
    const newline = section.indexOf('\n')
    const title = newline === -1 ? section.trim() : section.slice(0, newline).trim()
    const text = section.trim()
    const id = ID_MAP[title] || title.toLowerCase().replace(/\s+/g, '-')
    return { id, text }
  })

  cached = chunks
  return chunks
}
