import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { addCustomKnowledge, invalidateCache } from '@/lib/rag'
import { sendTelegramMessage } from '@/lib/telegram'

// Telegram webhook - receives bot updates
export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update.message
    if (!message?.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const allowedChatId = process.env.TELEGRAM_CHAT_ID
    if (allowedChatId && chatId !== allowedChatId) {
      return NextResponse.json({ ok: true })
    }

    const text = message.text.trim()

    // Command: /sync — move all pending to knowledge_custom
    if (text === '/sync') {
      return handleSync()
    }

    // Command: /pending — list pending knowledge
    if (text === '/pending') {
      return handlePending()
    }

    // Command: /clear — clear all pending
    if (text === '/clear') {
      return handleClear()
    }

    // Reply to a Q&A notification — save as pending knowledge
    if (message.reply_to_message) {
      return handleReply(text, message.reply_to_message.text)
    }

    // Direct text message (not a reply) — save as pending knowledge
    if (!text.startsWith('/')) {
      await addDoc(collection(db, 'knowledge_pending'), {
        text,
        source: 'telegram_direct',
        createdAt: Timestamp.now(),
      })
      await sendTelegramMessage('✅ 대기열에 저장했어요. /sync 로 지식에 반영하세요.')
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}

async function handleReply(replyText: string, originalText?: string) {
  // Extract original question from the notification format
  let context = ''
  if (originalText) {
    const qMatch = originalText.match(/Q:\s*(.+?)(?:\n|$)/)
    if (qMatch) {
      context = `Q: ${qMatch[1]}\nA: ${replyText}`
    }
  }

  const textToSave = context || replyText

  await addDoc(collection(db, 'knowledge_pending'), {
    text: textToSave,
    source: 'telegram_reply',
    originalQuestion: originalText || null,
    createdAt: Timestamp.now(),
  })

  await sendTelegramMessage('✅ 대기열에 저장했어요. /sync 로 지식에 반영하세요.')
  return NextResponse.json({ ok: true })
}

async function handleSync() {
  const snap = await getDocs(collection(db, 'knowledge_pending'))
  if (snap.empty) {
    await sendTelegramMessage('📭 대기열이 비어있어요.')
    return NextResponse.json({ ok: true })
  }

  let count = 0
  for (const d of snap.docs) {
    const data = d.data()
    await addCustomKnowledge(data.text, 'telegram')
    await deleteDoc(d.ref)
    count++
  }
  invalidateCache()

  await sendTelegramMessage(`✅ ${count}개 지식이 반영되었어요!`)
  return NextResponse.json({ ok: true })
}

async function handlePending() {
  const snap = await getDocs(collection(db, 'knowledge_pending'))
  if (snap.empty) {
    await sendTelegramMessage('📭 대기열이 비어있어요.')
    return NextResponse.json({ ok: true })
  }

  let msg = `📋 대기 중인 지식 (${snap.size}개)\n\n`
  snap.docs.forEach((d, i) => {
    const text = d.data().text
    const preview = text.length > 80 ? text.slice(0, 80) + '...' : text
    msg += `${i + 1}. ${preview}\n`
  })
  msg += '\n/sync 로 한번에 반영'

  await sendTelegramMessage(msg)
  return NextResponse.json({ ok: true })
}

async function handleClear() {
  const snap = await getDocs(collection(db, 'knowledge_pending'))
  if (snap.empty) {
    await sendTelegramMessage('📭 이미 비어있어요.')
    return NextResponse.json({ ok: true })
  }

  for (const d of snap.docs) {
    await deleteDoc(d.ref)
  }

  await sendTelegramMessage(`🗑️ ${snap.size}개 대기 항목을 삭제했어요.`)
  return NextResponse.json({ ok: true })
}
