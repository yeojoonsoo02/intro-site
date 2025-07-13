import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function savePrompt(prompt: string, reply: string) {
  try {
    await addDoc(collection(db, 'prompts'), {
      prompt,
      reply,
      createdAt: Timestamp.now(),
    })
  } catch (err) {
    console.error('Failed to save prompt:', err)
  }
}
