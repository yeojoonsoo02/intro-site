import { initializeApp, getApps, cert } from 'firebase-admin/app'
import {
  getFirestore,
  Firestore,
  FieldValue,
  Timestamp,
} from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'

let adminDb: Firestore | null = null
let adminAuth: Auth | null = null

// 서비스 계정 JSON을 읽는다.
//
// CI 빌드는 `vercel pull`이 만든 .env 파일에서 값을 읽는데, dotenv가 따옴표 안의 `\n`을 실제
// 줄바꿈으로 풀어 버린다. 그러면 private_key 문자열 안에 날 줄바꿈이 들어가 JSON.parse가
// "Bad control character"로 실패한다(Vercel 런타임의 env는 원문 그대로라 문제없다).
// 페이지를 빌드 때 사전 렌더하므로 빌드에서도 Firestore를 읽을 수 있어야 한다 — 실패하면
// 배포 직후 10분간 기본값으로 만든 페이지가 나간다. 문자열 안의 날 줄바꿈만 다시 이스케이프한다.
function parseServiceAccount(raw: string): Record<string, string> {
  try {
    return JSON.parse(raw)
  } catch {
    let repaired = ''
    let inString = false
    let escaped = false
    for (const ch of raw) {
      if (inString && (ch === '\n' || ch === '\r')) {
        if (ch === '\n') repaired += '\\n'
        continue
      }
      repaired += ch
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = !inString
    }
    return JSON.parse(repaired)
  }
}

try {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (key) {
    const app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({ credential: cert(parseServiceAccount(key)) })
    adminDb = getFirestore(app)
    adminAuth = getAuth(app)
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
  adminAuth = null
}

export { adminDb, adminAuth, FieldValue, Timestamp }
