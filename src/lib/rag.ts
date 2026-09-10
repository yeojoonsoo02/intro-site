import { splitKnowledge } from '@/lib/chunks'
import { searchChunks } from '@/lib/embeddings'

// 인사·짧은 리액션은 검색할 지식이 없다. 실제 로그에서 "안녕", "ㅋㅋ", "ㅎㅇ" 류가
// 꾸준히 들어오는데 이때도 임베딩 API를 부르고 있었다. 기본 정보만 주고 검색을 건너뛴다.
const SMALL_TALK = /^(안녕|하이|hi|hello|헬로|ㅎㅇ|반가워|반갑|ㅋ+|ㅎ+|ㅠ+|ㅜ+|굿|오케이|ok|넵|응|어|음|그래|고마워|감사|잘가|바이|bye)[\s!?.~ㅋㅎ]*$/i

function isSmallTalk(query: string): boolean {
  const q = query.trim()
  // 짧으면서 패턴에 맞을 때만. "안녕하세요 프로젝트 뭐 있어요?" 같은 건 검색해야 한다.
  return q.length <= 12 && SMALL_TALK.test(q)
}

export async function getKnowledgeContext(query: string): Promise<string> {
  try {
    const chunks = splitKnowledge()
    const basicChunk = chunks.find((c) => c.id === 'basic')
    if (isSmallTalk(query)) {
      return basicChunk ? `# ${basicChunk.text}` : ''
    }
    const relevant = await searchChunks(query, 3)
    // 기본 정보는 항상 포함. 검색 결과에 이미 있으면 중복하지 않는다.
    const resultChunks =
      basicChunk && !relevant.some((c) => c.id === 'basic') ? [basicChunk, ...relevant] : relevant
    return resultChunks.map((c) => `# ${c.text}`).join('\n\n')
  } catch (err) {
    // 임베딩 API가 죽으면 지식 전문을 통째로 넣는다(비싸지만 틀리진 않는다).
    console.error('RAG search failed, falling back to full context:', err)
    const { KNOWLEDGE } = await import('@/data/knowledge')
    return KNOWLEDGE
  }
}
