import { serverAdd, serverGet, serverDeleteDoc, serverTimestamp } from '@/lib/serverDb'
import { splitKnowledge } from '@/lib/chunks'
import { searchChunks, searchCustom, invalidateEmbeddingCache } from '@/lib/embeddings'

// --- Types ---

type CustomEntry = {
  id: string
  text: string
  category: string
  createdAt: unknown
}

// --- In-memory cache ---

let cachedCustom: CustomEntry[] | null = null
let cacheTimestamp = 0
let cachePromise: Promise<CustomEntry[]> | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function loadCustomEntries(): Promise<CustomEntry[]> {
  const now = Date.now()
  if (cachedCustom && now - cacheTimestamp < CACHE_TTL) {
    return cachedCustom
  }

  // Deduplicate concurrent requests
  if (cachePromise) return cachePromise

  cachePromise = (async () => {
    try {
      const snap = await serverGet('knowledge_custom')
      const entries: CustomEntry[] = snap.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          text: data.text as string,
          category: data.category as string,
          createdAt: data.createdAt,
        }
      })

      cachedCustom = entries
      cacheTimestamp = Date.now()
      return entries
    } finally {
      cachePromise = null
    }
  })()

  return cachePromise
}

export function invalidateCache() {
  cachedCustom = null
  cacheTimestamp = 0
  cachePromise = null
  invalidateEmbeddingCache()
}

// --- Knowledge context (RAG) ---

export async function getKnowledgeContext(query: string): Promise<string> {
  try {
    const chunks = splitKnowledge()
    const basicChunk = chunks.find((c) => c.id === 'basic')

    // Search for top 3 relevant chunks
    const relevant = await searchChunks(query, 3)

    // Always include basic info, deduplicate if already in results
    const resultChunks = basicChunk && !relevant.some((c) => c.id === 'basic')
      ? [basicChunk, ...relevant]
      : relevant

    let context = resultChunks.map((c) => `# ${c.text}`).join('\n\n')

    // Search custom knowledge
    try {
      const custom = await loadCustomEntries()
      if (custom.length > 0) {
        const customTexts = custom.map((e) => e.text)
        const matched = await searchCustom(query, customTexts)
        if (matched.length > 0) {
          context += `\n\n# 추가 정보\n${matched.join('\n')}`
        }
      }
    } catch {
      // Firestore unavailable — skip custom knowledge
    }

    return context
  } catch (err) {
    // Embedding API unavailable — fallback to full knowledge
    console.error('RAG search failed, falling back to full context:', err)
    return fallbackFullContext()
  }
}

async function fallbackFullContext(): Promise<string> {
  const { KNOWLEDGE } = await import('@/data/knowledge')
  try {
    const custom = await loadCustomEntries()
    if (custom.length === 0) return KNOWLEDGE
    const customText = custom.map((e) => e.text).join('\n')
    return `${KNOWLEDGE}\n\n# 추가 정보\n${customText}`
  } catch {
    return KNOWLEDGE
  }
}

// --- Custom knowledge CRUD ---

export async function addCustomKnowledge(
  text: string,
  category: string = 'custom',
): Promise<string> {
  const id = await serverAdd('knowledge_custom', {
    text,
    category,
    createdAt: serverTimestamp(),
  })
  invalidateCache()
  return id
}

export async function listCustomKnowledge(): Promise<CustomEntry[]> {
  return loadCustomEntries()
}

export async function deleteCustomKnowledge(id: string): Promise<void> {
  await serverDeleteDoc('knowledge_custom', id)
  invalidateCache()
}
