import { GoogleGenerativeAI } from '@google/generative-ai'
import crypto from 'crypto'
import { splitKnowledge, type Chunk } from '@/lib/chunks'
import { PRECOMPUTED_EMBEDDINGS } from '@/data/chunkEmbeddings.generated'

// --- Embedding cache ---

type CachedEmbedding = { id: string; vector: number[] }

let chunkEmbeddings: CachedEmbedding[] | null = null
let embedPromise: Promise<CachedEmbedding[]> | null = null

// 커스텀 지식 임베딩 캐시(텍스트 내용 → 벡터). 동일 텍스트는 항상 동일 임베딩이므로
// 채팅 요청마다 재계산하던 N+1 임베딩 API 호출을 제거한다. 텍스트가 바뀌면 자동 미스.
const customEmbedCache = new Map<string, number[]>()
const CUSTOM_CACHE_MAX = 500

// 질문 임베딩 캐시. 실제 로그를 보면 "지금 어디야?" 같은 같은 질문이 반복적으로 들어온다.
// 표기 흔들림(대소문자·공백·물음표)을 정규화해 맞춰야 캐시가 실제로 맞는다.
const queryEmbedCache = new Map<string, number[]>()
const QUERY_CACHE_MAX = 300

function normalizeQuery(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[?？!！.。~〜\s]+$/u, '')
}

// Map은 삽입 순서를 보존하므로 가장 오래된 항목부터 제거해 상한을 유지한다.
function setBounded(cache: Map<string, number[]>, key: string, value: number[], max: number): void {
  if (cache.size >= max) {
    const oldest = cache.keys().next().value
    if (oldest !== undefined) cache.delete(oldest)
  }
  cache.set(key, value)
}

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: PRECOMPUTED_EMBEDDINGS.model })
}

// 네트워크가 한 번 튀면 RAG 전체가 실패해 지식 전문을 통째로 넣는 폴백으로 떨어진다.
// 그쪽이 토큰을 더 쓰므로, 실패한 호출은 과금되지 않는다는 점을 이용해 짧게 재시도한다.
async function embed(text: string, attempts = 3): Promise<number[]> {
  const model = getModel()
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await model.embedContent(text)
      return result.embedding.values
    } catch (err) {
      lastErr = err
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** i))
      }
    }
  }
  throw lastErr
}

async function embedQuery(query: string): Promise<number[]> {
  const key = normalizeQuery(query)
  const hit = queryEmbedCache.get(key)
  if (hit) return hit
  const vector = await embed(query)
  setBounded(queryEmbedCache, key, vector, QUERY_CACHE_MAX)
  return vector
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

const chunkHash = (text: string): string =>
  crypto.createHash('sha256').update(text).digest('hex').slice(0, 16)

// 빌드 타임에 계산해 둔 벡터를 쓴다. 콜드스타트마다 청크를 순차 임베딩하던
// API 호출(청크 수만큼)이 사라진다. knowledge.ts만 고치고 재생성을 잊은 청크는
// 해시가 어긋나므로 그 청크만 실시간 임베딩으로 폴백한다(조용히 틀리는 것보다 낫다).
async function getChunkEmbeddings(): Promise<CachedEmbedding[]> {
  if (chunkEmbeddings) return chunkEmbeddings
  if (embedPromise) return embedPromise

  embedPromise = (async () => {
    try {
      const chunks = splitKnowledge()
      const precomputed = new Map(
        PRECOMPUTED_EMBEDDINGS.chunks.map((c) => [c.id, c]),
      )

      const results: CachedEmbedding[] = []
      const stale: string[] = []
      for (const chunk of chunks) {
        const hit = precomputed.get(chunk.id)
        if (hit && hit.hash === chunkHash(chunk.text)) {
          results.push({ id: chunk.id, vector: hit.vector })
          continue
        }
        stale.push(chunk.id)
        results.push({ id: chunk.id, vector: await embed(chunk.text) })
      }

      if (stale.length > 0) {
        console.warn(
          `[embeddings] 사전계산본이 오래됐습니다(${stale.join(', ')}). \`npm run embeddings:build\`를 실행하세요.`,
        )
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
    embedQuery(query),
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

  const queryVec = await embedQuery(query)
  const results: { text: string; score: number }[] = []

  for (const text of texts) {
    let vec = customEmbedCache.get(text)
    if (!vec) {
      vec = await embed(text)
      setBounded(customEmbedCache, text, vec, CUSTOM_CACHE_MAX)
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
  queryEmbedCache.clear()
}
