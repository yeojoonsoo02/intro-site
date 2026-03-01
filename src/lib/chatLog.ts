import { serverAdd, serverTimestamp } from '@/lib/serverDb'

export async function saveChatLog(
  question: string,
  answer: string,
  userInfo?: Record<string, unknown>,
) {
  try {
    await serverAdd('chat_logs', {
      question,
      answer,
      userInfo: userInfo || null,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.error('Chat log save error:', err)
  }
}
