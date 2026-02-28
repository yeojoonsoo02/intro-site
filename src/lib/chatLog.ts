import { db } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export async function saveChatLog(
  question: string,
  answer: string,
  userInfo?: Record<string, unknown>,
) {
  try {
    await addDoc(collection(db, 'chat_logs'), {
      question,
      answer,
      userInfo: userInfo || null,
      createdAt: Timestamp.now(),
    })
  } catch (err) {
    console.error('Chat log save error:', err)
  }
}
