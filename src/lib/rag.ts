import { db } from '@/lib/firebase'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore'
import { KNOWLEDGE } from '@/data/knowledge'

// --- Types ---

type CustomEntry = {
  id: string
  text: string
  category: string
  createdAt: Timestamp
}

// --- In-memory cache ---

let cachedCustom: CustomEntry[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function loadCustomEntries(): Promise<CustomEntry[]> {
  const now = Date.now()
  if (cachedCustom && now - cacheTimestamp < CACHE_TTL) {
    return cachedCustom
  }

  const snap = await getDocs(collection(db, 'knowledge_custom'))
  const entries: CustomEntry[] = []
  snap.forEach((d) => {
    const data = d.data()
    entries.push({
      id: d.id,
      text: data.text,
      category: data.category,
      createdAt: data.createdAt,
    })
  })

  cachedCustom = entries
  cacheTimestamp = now
  return entries
}

export function invalidateCache() {
  cachedCustom = null
  cacheTimestamp = 0
}

// --- Knowledge context ---

export async function getKnowledgeContext(): Promise<string> {
  const custom = await loadCustomEntries()
  if (custom.length === 0) return KNOWLEDGE

  const customText = custom.map((e) => e.text).join('\n')
  return `${KNOWLEDGE}\n\n# 추가 정보\n${customText}`
}

// --- Custom knowledge CRUD ---

export async function addCustomKnowledge(
  text: string,
  category: string = 'custom',
): Promise<string> {
  const docRef = await addDoc(collection(db, 'knowledge_custom'), {
    text,
    category,
    createdAt: Timestamp.now(),
  })
  invalidateCache()
  return docRef.id
}

export async function listCustomKnowledge(): Promise<CustomEntry[]> {
  return loadCustomEntries()
}

export async function deleteCustomKnowledge(id: string): Promise<void> {
  await deleteDoc(doc(db, 'knowledge_custom', id))
  invalidateCache()
}
