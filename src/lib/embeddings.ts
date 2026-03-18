import { GoogleGenerativeAI } from '@google/generative-ai'
import { splitKnowledge, type Chunk } from '@/lib/chunks'

// --- Embedding cache ---

type CachedEmbedding = { id: string; vector: number[] }

let chunkEmbeddings: CachedEmbedding[] | null = null
let embedPromise: Promise<CachedEmbedding[]> | null = null

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
  const topIds = scored.slice(0, topK).map((s) => s.id)

  const chunkMap = new Map(chunks.map((c) => [c.id, c]))
  return topIds.map((id) => chunkMap.get(id)!).filter(Boolean)
}

export async function searchCustom(
  query: string,
  texts: string[],
  threshold = 0.5,
): Promise<string[]> {
  if (texts.length === 0) return []

  const queryVec = await embed(query)
  const results: { text: string; score: number }[] = []

  for (const text of texts) {
    const vec = await embed(text)
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
}
