import { initializeApp, getApps, cert } from 'firebase-admin/app'
import {
  getFirestore,
  Firestore,
  FieldValue,
} from 'firebase-admin/firestore'

let adminDb: Firestore | null = null

try {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (key) {
    const app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({ credential: cert(JSON.parse(key)) })
    adminDb = getFirestore(app)
    console.log('[firebaseAdmin] Admin SDK initialized successfully')
  } else {
    console.warn(
      '[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_KEY not set — falling back to Client SDK',
    )
  }
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[firebaseAdmin] Admin SDK init FAILED: ${message}`)
  console.warn(
    '[firebaseAdmin] All Firestore operations will use Client SDK (Firestore Rules apply)',
  )
  adminDb = null
}

export { adminDb, FieldValue }
export const isAdminReady = !!adminDb
