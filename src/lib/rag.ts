import { serverAdd, serverGet, serverDeleteDoc, serverTimestamp } from '@/lib/serverDb'
import { KNOWLEDGE } from '@/data/knowledge'

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
}

// --- Knowledge context ---

export async function getKnowledgeContext(): Promise<string> {
  try {
    const custom = await loadCustomEntries()
    if (custom.length === 0) return KNOWLEDGE

    const customText = custom.map((e) => e.text).join('\n')
    return `${KNOWLEDGE}\n\n# 추가 정보\n${customText}`
  } catch {
    // Firestore unavailable — still return static knowledge
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
