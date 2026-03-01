import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { addCustomKnowledge, invalidateCache } from '@/lib/rag'
import { sendTelegramMessage } from '@/lib/telegram'

// Verify request comes from Telegram using secret token
function verifyTelegramRequest(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret) return false
  const token = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  return token === secret
}

// Telegram webhook - receives bot updates
export async function POST(req: NextRequest) {
  if (!verifyTelegramRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

    // Command: /questions — list recent chat questions
    if (text === '/questions') {
      return handleQuestions()
    }

    // Command: /answer N <text> — answer a specific question
    const answerMatch = text.match(/^\/answer\s+(\d+)\s+([\s\S]+)/)
    if (answerMatch) {
      return handleAnswer(parseInt(answerMatch[1]), answerMatch[2].trim())
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

async function getRecentQuestions(count: number) {
  const q = query(
    collection(db, 'chat_logs'),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return { question: data.question as string, answer: data.answer as string }
  })
}

async function handleQuestions() {
  try {
    const questions = await getRecentQuestions(10)
    if (questions.length === 0) {
      await sendTelegramMessage('📭 아직 질문이 없어요.')
      return NextResponse.json({ ok: true })
    }

    let msg = `📋 최근 질문 (${questions.length}개)\n\n`
    questions.forEach((item, i) => {
      const qPreview =
        item.question.length > 50
          ? item.question.slice(0, 50) + '...'
          : item.question
      const aPreview =
        item.answer.length > 50
          ? item.answer.slice(0, 50) + '...'
          : item.answer
      msg += `<b>${i + 1}.</b> ${escapeHtml(qPreview)}\n   → ${escapeHtml(aPreview)}\n\n`
    })
    msg += '<i>/answer N 답변내용 으로 정확한 답변을 추가하세요.</i>'

    await sendTelegramMessage(msg)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('handleQuestions error:', err)
    await sendTelegramMessage('❌ 질문 목록을 불러오지 못했어요.')
    return NextResponse.json({ ok: true })
  }
}

async function handleAnswer(num: number, answerText: string) {
  try {
    const questions = await getRecentQuestions(10)
    if (questions.length === 0) {
      await sendTelegramMessage('📭 질문이 없어요.')
      return NextResponse.json({ ok: true })
    }

    if (num < 1 || num > questions.length) {
      await sendTelegramMessage(
        `⚠️ 1~${questions.length} 사이 번호를 입력해주세요.`,
      )
      return NextResponse.json({ ok: true })
    }

    const target = questions[num - 1]
    const knowledgeText = `Q: ${target.question}\nA: ${answerText}`

    await addDoc(collection(db, 'knowledge_pending'), {
      text: knowledgeText,
      source: 'telegram_answer',
      originalQuestion: target.question,
      createdAt: Timestamp.now(),
    })

    const qPreview =
      target.question.length > 40
        ? target.question.slice(0, 40) + '...'
        : target.question
    await sendTelegramMessage(
      `✅ "${escapeHtml(qPreview)}"에 대한 답변을 대기열에 저장했어요.\n/sync 로 지식에 반영하세요.`,
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('handleAnswer error:', err)
    await sendTelegramMessage('❌ 답변 저장에 실패했어요.')
    return NextResponse.json({ ok: true })
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
