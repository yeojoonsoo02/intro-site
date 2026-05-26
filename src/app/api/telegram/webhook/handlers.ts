import { NextResponse } from 'next/server'
import {
  serverAdd,
  serverGet,
  serverQuery,
  serverBatch,
  serverTimestamp,
} from '@/lib/serverDb'
import { addCustomKnowledge, invalidateCache } from '@/lib/rag'
import { sendTelegramMessage, escapeHtml } from '@/lib/telegram'

let syncInProgress = false

const OK_RESPONSE = (): NextResponse => NextResponse.json({ ok: true })

export async function handleDirectKnowledge(text: string): Promise<NextResponse> {
  await serverAdd('knowledge_pending', {
    text,
    source: 'telegram_direct',
    createdAt: serverTimestamp(),
  })
  await sendTelegramMessage('✅ 대기열에 저장했어요. /sync 로 지식에 반영하세요.')
  return OK_RESPONSE()
}

export async function handleReply(
  replyText: string,
  originalText?: string,
): Promise<NextResponse> {
  let context = ''
  if (originalText) {
    const qMatch = originalText.match(/Q:\s*(.+?)(?:\n|$)/)
    if (qMatch) {
      context = `Q: ${qMatch[1]}\nA: ${replyText}`
    }
  }

  await serverAdd('knowledge_pending', {
    text: context || replyText,
    source: 'telegram_reply',
    originalQuestion: originalText || null,
    createdAt: serverTimestamp(),
  })

  await sendTelegramMessage('✅ 대기열에 저장했어요. /sync 로 지식에 반영하세요.')
  return OK_RESPONSE()
}

export async function handleSync(): Promise<NextResponse> {
  if (syncInProgress) {
    await sendTelegramMessage('⏳ 이미 동기화 중이에요. 잠시 후 다시 시도해주세요.')
    return OK_RESPONSE()
  }

  syncInProgress = true
  try {
    const snap = await serverGet('knowledge_pending')
    if (snap.empty) {
      await sendTelegramMessage('📭 대기열이 비어있어요.')
      return OK_RESPONSE()
    }

    const texts = snap.docs.map((d) => d.data().text as string)

    for (const text of texts) {
      await addCustomKnowledge(text, 'telegram')
    }

    const batch = serverBatch()
    snap.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
    invalidateCache()

    await sendTelegramMessage(`✅ ${texts.length}개 지식이 반영되었어요!`)
    return OK_RESPONSE()
  } finally {
    syncInProgress = false
  }
}

export async function handlePending(): Promise<NextResponse> {
  const snap = await serverGet('knowledge_pending')
  if (snap.empty) {
    await sendTelegramMessage('📭 대기열이 비어있어요.')
    return OK_RESPONSE()
  }

  let msg = `📋 대기 중인 지식 (${snap.size}개)\n\n`
  snap.docs.forEach((d, i) => {
    const text = d.data().text as string
    const preview = text.length > 80 ? text.slice(0, 80) + '...' : text
    msg += `${i + 1}. ${preview}\n`
  })
  msg += '\n/sync 로 한번에 반영'

  await sendTelegramMessage(msg)
  return OK_RESPONSE()
}

interface RecentQuestion {
  question: string
  answer: string
}

async function getRecentQuestions(count: number): Promise<RecentQuestion[]> {
  const snap = await serverQuery('chat_logs', {
    orderByField: 'createdAt',
    orderDir: 'desc',
    limitCount: count,
  })
  return snap.docs.map((d) => {
    const data = d.data()
    return { question: data.question as string, answer: data.answer as string }
  })
}

export async function handleQuestions(): Promise<NextResponse> {
  try {
    const questions = await getRecentQuestions(10)
    if (questions.length === 0) {
      await sendTelegramMessage('📭 아직 질문이 없어요.')
      return OK_RESPONSE()
    }

    let msg = `📋 최근 질문 (${questions.length}개)\n\n`
    questions.forEach((item, i) => {
      const qPreview =
        item.question.length > 50 ? item.question.slice(0, 50) + '...' : item.question
      const aPreview =
        item.answer.length > 50 ? item.answer.slice(0, 50) + '...' : item.answer
      msg += `<b>${i + 1}.</b> ${escapeHtml(qPreview)}\n   → ${escapeHtml(aPreview)}\n\n`
    })
    msg += '<i>/answer N 답변내용 으로 정확한 답변을 추가하세요.</i>'

    await sendTelegramMessage(msg)
    return OK_RESPONSE()
  } catch (err) {
    console.error('handleQuestions error:', err)
    await sendTelegramMessage('❌ 질문 목록을 불러오지 못했어요.')
    return OK_RESPONSE()
  }
}

export async function handleAnswer(num: number, answerText: string): Promise<NextResponse> {
  try {
    const questions = await getRecentQuestions(10)
    if (questions.length === 0) {
      await sendTelegramMessage('📭 질문이 없어요.')
      return OK_RESPONSE()
    }

    if (num < 1 || num > questions.length) {
      await sendTelegramMessage(`⚠️ 1~${questions.length} 사이 번호를 입력해주세요.`)
      return OK_RESPONSE()
    }

    const target = questions[num - 1]
    const knowledgeText = `Q: ${target.question}\nA: ${answerText}`

    await serverAdd('knowledge_pending', {
      text: knowledgeText,
      source: 'telegram_answer',
      originalQuestion: target.question,
      createdAt: serverTimestamp(),
    })

    const qPreview =
      target.question.length > 40 ? target.question.slice(0, 40) + '...' : target.question
    await sendTelegramMessage(
      `✅ "${escapeHtml(qPreview)}"에 대한 답변을 대기열에 저장했어요.\n/sync 로 지식에 반영하세요.`,
    )
    return OK_RESPONSE()
  } catch (err) {
    console.error('handleAnswer error:', err)
    await sendTelegramMessage('❌ 답변 저장에 실패했어요.')
    return OK_RESPONSE()
  }
}

export async function handleClear(): Promise<NextResponse> {
  const snap = await serverGet('knowledge_pending')
  if (snap.empty) {
    await sendTelegramMessage('📭 이미 비어있어요.')
    return OK_RESPONSE()
  }

  const batch = serverBatch()
  snap.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()

  await sendTelegramMessage(`🗑️ ${snap.size}개 대기 항목을 삭제했어요.`)
  return OK_RESPONSE()
}
