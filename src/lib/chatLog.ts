import { serverAdd, serverTimestamp } from '@/lib/serverDb'

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
) {
  try {
    const safeUserInfo = userInfo ? sanitizeUserInfo(userInfo) : null
    await serverAdd('chat_logs', {
      question,
      answer,
      userInfo: safeUserInfo,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.error('Chat log save error:', err)
  }
}
