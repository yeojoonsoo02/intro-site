import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage, type TelegramUpdate } from '@/lib/telegram'
import { verifyTelegramRequest } from './auth'
import {
  handleAnswer,
  handleClear,
  handleDirectKnowledge,
  handlePending,
  handleQuestions,
  handleReply,
  handleSync,
} from './handlers'

const MAX_ANSWER_LENGTH = 2000

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!verifyTelegramRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const update = (await req.json()) as TelegramUpdate
    const message = update.message
    if (!message?.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const allowedChatId = process.env.TELEGRAM_CHAT_ID
    // 허용 chat_id 미설정 시 거부(fail-closed) — 오설정으로 누구나 통과하는 것 방지
    if (!allowedChatId || chatId !== allowedChatId) {
      return NextResponse.json({ ok: true })
    }

    const text = message.text.trim()

    if (text === '/sync') return await handleSync()
    if (text === '/pending') return await handlePending()
    if (text === '/clear') return await handleClear()
    if (text === '/questions') return await handleQuestions()

    const answerMatch = text.match(/^\/answer\s+(\d+)\s+([\s\S]+)/)
    if (answerMatch) {
      const answerText = answerMatch[2].trim()
      if (answerText.length > MAX_ANSWER_LENGTH) {
        await sendTelegramMessage(
          `⚠️ 답변이 너무 깁니다. ${MAX_ANSWER_LENGTH}자 이하로 입력해주세요.`,
        )
        return NextResponse.json({ ok: true })
      }
      return await handleAnswer(parseInt(answerMatch[1]), answerText)
    }

    if (message.reply_to_message) {
      return await handleReply(text, message.reply_to_message.text)
    }

    if (!text.startsWith('/')) {
      return await handleDirectKnowledge(text)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
