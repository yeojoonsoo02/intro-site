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
