import { GoogleGenerativeAI } from '@google/generative-ai'
import { splitKnowledge, type Chunk } from '@/lib/chunks'

// --- Embedding cache ---

type CachedEmbedding = { id: string; vector: number[] }

let chunkEmbeddings: CachedEmbedding[] | null = null
let embedPromise: Promise<CachedEmbedding[]> | null = null

// 커스텀 지식 임베딩 캐시(텍스트 내용 → 벡터). 동일 텍스트는 항상 동일 임베딩이므로
// 채팅 요청마다 재계산하던 N+1 임베딩 API 호출을 제거한다. 텍스트가 바뀌면 자동 미스.
const customEmbedCache = new Map<string, number[]>()
const CUSTOM_CACHE_MAX = 500

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
}

async function embed(text: string): Promise<number[]> {
  const model = getModel()
  const result = await model.embedContent(text)
  return result.embedding.values
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

async function getChunkEmbeddings(): Promise<CachedEmbedding[]> {
  if (chunkEmbeddings) return chunkEmbeddings
  if (embedPromise) return embedPromise

  embedPromise = (async () => {
    try {
      const chunks = splitKnowledge()
      const results: CachedEmbedding[] = []
      // Embed sequentially to avoid rate limits
      for (const chunk of chunks) {
        const vector = await embed(chunk.text)
        results.push({ id: chunk.id, vector })
      }
      chunkEmbeddings = results
      return results
    } finally {
      embedPromise = null
    }
  })()

  return embedPromise
}

export async function searchChunks(
  query: string,
  topK = 3,
  minScore = 0.3,
): Promise<Chunk[]> {
  const chunks = splitKnowledge()
  const [queryVec, cached] = await Promise.all([
    embed(query),
    getChunkEmbeddings(),
  ])

  const scored = cached.map((ce) => ({
    id: ce.id,
    score: cosineSim(queryVec, ce.vector),
  }))

  scored.sort((a, b) => b.score - a.score)
  // 유사도가 임계값 미만인 청크는 제외해 무관한 컨텍스트 주입을 막는다.
  // (basic 청크는 getKnowledgeContext가 항상 별도 포함하므로 여기서 빠져도 안전)
  const topIds = scored
    .filter((s) => s.score >= minScore)
    .slice(0, topK)
    .map((s) => s.id)

  const chunkMap = new Map(chunks.map((c) => [c.id, c]))
  return topIds.map((id) => chunkMap.get(id)!).filter(Boolean)
}

export async function searchCustom(
  query: string,
  texts: string[],
  threshold = 0.4,
): Promise<string[]> {
  if (texts.length === 0) return []

  const queryVec = await embed(query)
  const results: { text: string; score: number }[] = []

  for (const text of texts) {
    let vec = customEmbedCache.get(text)
    if (!vec) {
      vec = await embed(text)
      // 단순 용량 상한: 초과 시 가장 오래된 항목부터 제거(무한 증가 방지)
      if (customEmbedCache.size >= CUSTOM_CACHE_MAX) {
        const oldest = customEmbedCache.keys().next().value
        if (oldest !== undefined) customEmbedCache.delete(oldest)
      }
      customEmbedCache.set(text, vec)
    }
    const score = cosineSim(queryVec, vec)
    if (score >= threshold) {
      results.push({ text, score })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.map((r) => r.text)
}

export function invalidateEmbeddingCache() {
  chunkEmbeddings = null
  embedPromise = null
  customEmbedCache.clear()
}
