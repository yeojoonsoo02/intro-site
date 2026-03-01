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
  }
} catch (err) {
  console.error('Firebase Admin init failed:', err)
}

export { adminDb, FieldValue }
export const isAdminReady = !!adminDb
