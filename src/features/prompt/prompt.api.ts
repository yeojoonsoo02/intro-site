import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function savePrompt(text: string) {
  try {
    await addDoc(collection(db, 'prompts'), {
      text,
      createdAt: Timestamp.now(),
    })
  } catch (err) {
    console.error('Failed to save prompt:', err)
  }
}
