/**
 * Server-side Firestore abstraction.
 * Uses Firebase Admin SDK when FIREBASE_SERVICE_ACCOUNT_KEY is set (bypasses security rules).
 * Falls back to client SDK otherwise (respects security rules).
 */
import { adminDb, isAdminReady, FieldValue } from '@/lib/firebaseAdmin'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'

// Unified document interface
export interface ServerDoc {
  id: string
  data: () => Record<string, unknown>
  ref: unknown
}

export interface ServerSnapshot {
  empty: boolean
  size: number
  docs: ServerDoc[]
}

export interface ServerBatch {
  delete: (ref: unknown) => void
  commit: () => Promise<void>
}

// Timestamp helper
export function serverTimestamp(): unknown {
  if (isAdminReady) return FieldValue.serverTimestamp()
  return Timestamp.now()
}

// Collection operations
export async function serverAdd(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<string> {
  if (isAdminReady && adminDb) {
    const ref = await adminDb.collection(collectionName).add(data)
    return ref.id
  }
  const ref = await addDoc(collection(db, collectionName), data)
  return ref.id
}

export async function serverGet(
  collectionName: string,
): Promise<ServerSnapshot> {
  if (isAdminReady && adminDb) {
    const snap = await adminDb.collection(collectionName).get()
    return {
      empty: snap.empty,
      size: snap.size,
      docs: snap.docs.map((d) => ({
        id: d.id,
        data: () => d.data() as Record<string, unknown>,
        ref: d.ref,
      })),
    }
  }
  const snap = await getDocs(collection(db, collectionName))
  return {
    empty: snap.empty,
    size: snap.size,
    docs: snap.docs.map((d) => ({
      id: d.id,
      data: () => d.data() as Record<string, unknown>,
      ref: d.ref,
    })),
  }
}

export async function serverQuery(
  collectionName: string,
  opts: { orderByField: string; orderDir: 'asc' | 'desc'; limitCount: number },
): Promise<ServerSnapshot> {
  if (isAdminReady && adminDb) {
    const snap = await adminDb
      .collection(collectionName)
      .orderBy(opts.orderByField, opts.orderDir)
      .limit(opts.limitCount)
      .get()
    return {
      empty: snap.empty,
      size: snap.size,
      docs: snap.docs.map((d) => ({
        id: d.id,
        data: () => d.data() as Record<string, unknown>,
        ref: d.ref,
      })),
    }
  }
  const q = query(
    collection(db, collectionName),
    orderBy(opts.orderByField, opts.orderDir),
    limit(opts.limitCount),
  )
  const snap = await getDocs(q)
  return {
    empty: snap.empty,
    size: snap.size,
    docs: snap.docs.map((d) => ({
      id: d.id,
      data: () => d.data() as Record<string, unknown>,
      ref: d.ref,
    })),
  }
}

export async function serverDeleteDoc(
  collectionName: string,
  docId: string,
): Promise<void> {
  if (isAdminReady && adminDb) {
    await adminDb.collection(collectionName).doc(docId).delete()
    return
  }
  await deleteDoc(doc(db, collectionName, docId))
}

export function serverBatch(): ServerBatch {
  if (isAdminReady && adminDb) {
    const batch = adminDb.batch()
    return {
      delete: (ref: unknown) => {
        batch.delete(
          ref as FirebaseFirestore.DocumentReference,
        )
      },
      commit: () => batch.commit().then(() => {}),
    }
  }
  const batch = writeBatch(db)
  return {
    delete: (ref: unknown) => {
      batch.delete(
        ref as import('firebase/firestore').DocumentReference,
      )
    },
    commit: () => batch.commit(),
  }
}
