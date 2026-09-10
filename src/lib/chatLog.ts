import { adminDb, FieldValue } from '@/lib/firebaseAdmin'

const MAX_USERINFO_FIELDS = 10
const MAX_USERINFO_VALUE_LENGTH = 200

function sanitizeUserInfo(
  info: Record<string, unknown>,
): Record<string, unknown> | null {
  const safe: Record<string, unknown> = {}
  let count = 0
  for (const [key, val] of Object.entries(info)) {
    if (count >= MAX_USERINFO_FIELDS) break
    if (typeof val === 'string') {
      safe[key] = val.slice(0, MAX_USERINFO_VALUE_LENGTH)
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      safe[key] = val
    }
    count++
  }
  return Object.keys(safe).length > 0 ? safe : null
}

export async function saveChatLog(
  question: string,
  answer: string,
  userInfo?: Record<string, unknown>,
  // 정보가 없어 답하지 못한 질문 표시 — 지식으로 채워 넣어야 할 목록을 고르는 기준
  unanswered = false,
) {
  if (!adminDb) return
  try {
    const safeUserInfo = userInfo ? sanitizeUserInfo(userInfo) : null
    await adminDb.collection('chat_logs').add({
      question,
      answer,
      userInfo: safeUserInfo,
      unanswered,
      createdAt: FieldValue.serverTimestamp(),
    })
  } catch (err) {
    console.error('Chat log save error:', err)
  }
}
