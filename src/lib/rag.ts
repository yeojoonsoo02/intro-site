import { GoogleGenerativeAI } from '@google/generative-ai'
import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles'
import { fetchProfile, fetchDevProfile } from '@/features/profile/profile.api'
import type { Interest } from '@/features/profile/profile.model'

// --- Types ---

export type KnowledgeChunk = {
  id: string
  text: string
  embedding: number[]
  category: string
  lang: string
}

// --- Embedding ---

const EMBEDDING_MODEL = 'text-embedding-004'

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is required for RAG')
  return new GoogleGenerativeAI(apiKey)
}

export async function embedText(text: string): Promise<number[]> {
  const genAI = getGenAI()
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
  const result = await model.embedContent(text)
  return result.embedding.values
}

// --- Cosine similarity ---

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

// --- In-memory cache ---

let cachedChunks: KnowledgeChunk[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function loadChunks(): Promise<KnowledgeChunk[]> {
  const now = Date.now()
  if (cachedChunks && now - cacheTimestamp < CACHE_TTL) {
    return cachedChunks
  }

  const snap = await getDocs(collection(db, 'knowledge'))
  const chunks: KnowledgeChunk[] = []
  snap.forEach((doc) => {
    const data = doc.data()
    chunks.push({
      id: doc.id,
      text: data.text,
      embedding: data.embedding,
      category: data.category,
      lang: data.lang,
    })
  })

  cachedChunks = chunks
  cacheTimestamp = now
  return chunks
}

export function invalidateCache() {
  cachedChunks = null
  cacheTimestamp = 0
}

// --- Retrieval ---

export async function retrieveContext(
  queryText: string,
  topK: number = 5,
): Promise<string> {
  const chunks = await loadChunks()
  if (chunks.length === 0) return ''

  const queryEmbedding = await embedText(queryText)

  const scored = chunks.map((chunk) => ({
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }))

  scored.sort((a, b) => b.score - a.score)

  return scored
    .slice(0, topK)
    .filter((s) => s.score > 0.3)
    .map((s) => s.text)
    .join('\n')
}

// --- Chunking helpers ---

function interestToString(interest: Interest): string {
  return typeof interest === 'string' ? interest : interest.label
}

function profileToChunks(
  profile: { name: string; tagline: string; email: string; interests: Interest[]; intro: string[]; region: string },
  category: string,
  lang: string,
): { text: string; category: string; lang: string }[] {
  const chunks: { text: string; category: string; lang: string }[] = []

  chunks.push({ text: `이름: ${profile.name}`, category, lang })
  chunks.push({ text: `직업/소개: ${profile.tagline}`, category, lang })
  chunks.push({ text: `이메일: ${profile.email}`, category, lang })
  chunks.push({ text: `지역: ${profile.region}`, category, lang })

  for (const interest of profile.interests) {
    chunks.push({
      text: `관심사: ${interestToString(interest)}`,
      category,
      lang,
    })
  }

  for (const paragraph of profile.intro) {
    if (paragraph.trim()) {
      chunks.push({ text: paragraph.trim(), category, lang })
    }
  }

  return chunks
}

// --- Seed knowledge ---

export async function seedKnowledge(lang?: string): Promise<number> {
  const langs = lang ? [lang] : ['ko', 'en', 'ja', 'zh']

  // Clear existing chunks for target languages
  for (const l of langs) {
    const q = query(collection(db, 'knowledge'), where('lang', '==', l))
    const snap = await getDocs(q)
    const deletes = snap.docs.map((d) => deleteDoc(d.ref))
    await Promise.all(deletes)
  }

  const allChunks: { text: string; category: string; lang: string }[] = []

  for (const l of langs) {
    // Default profile chunks
    const defaultProfile = DEFAULT_PROFILES[l]
    if (defaultProfile) {
      allChunks.push(...profileToChunks(defaultProfile, 'profile', l))
    }

    // Firestore profile (may have been edited by admin)
    try {
      const firestoreProfile = await fetchProfile(l)
      if (firestoreProfile) {
        allChunks.push(...profileToChunks(firestoreProfile, 'profile', l))
      }
    } catch {
      // Firestore may not be available during build
    }

    // Dev profile
    try {
      const devProfile = await fetchDevProfile(l)
      if (devProfile) {
        allChunks.push(...profileToChunks(devProfile, 'dev', l))
      }
    } catch {
      // Firestore may not be available during build
    }
  }

  // Deduplicate by text
  const seen = new Set<string>()
  const uniqueChunks = allChunks.filter((c) => {
    if (seen.has(c.text)) return false
    seen.add(c.text)
    return true
  })

  // Embed and store
  let count = 0
  for (const chunk of uniqueChunks) {
    const embedding = await embedText(chunk.text)
    await addDoc(collection(db, 'knowledge'), {
      text: chunk.text,
      embedding,
      category: chunk.category,
      lang: chunk.lang,
      createdAt: Timestamp.now(),
    })
    count++
  }

  invalidateCache()
  return count
}

// --- Add custom knowledge ---

export async function addKnowledge(
  text: string,
  category: string = 'custom',
  lang: string = 'ko',
): Promise<string> {
  const embedding = await embedText(text)
  const docRef = await addDoc(collection(db, 'knowledge'), {
    text,
    embedding,
    category,
    lang,
    createdAt: Timestamp.now(),
  })
  invalidateCache()
  return docRef.id
}
