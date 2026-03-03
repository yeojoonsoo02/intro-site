import { KNOWLEDGE } from '@/data/knowledge'

export type Chunk = { id: string; text: string }

const ID_MAP: Record<string, string> = {
  '기본 정보': 'basic',
  '학력': 'education',
  '군대': 'military',
  '자취': 'living',
  '근황': 'recent',
  '관심사': 'interests',
  '음악': 'music',
  '여행': 'travel',
  '소개': 'intro',
  '꿈과 목표': 'goals',
  '성격': 'personality',
  '취미': 'hobbies',
  '습관과 루틴': 'routine',
  '가치관과 마인드셋': 'values',
  '인간관계': 'relationships',
  '가족': 'family',
  '친구': 'friends',
  '음식 취향': 'food',
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
