import { sendQuestionAnswer } from '@/lib/webhook'
import { saveChatLog } from '@/lib/chatLog'
import { isUnanswered } from '@/lib/unanswered'
import {
  sendTelegramMessage,
  formatChatNotification,
  isTelegramConfigured,
} from '@/lib/telegram'

function logSideEffect(context: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`[${context}] ${msg}`)
}

export function fireSideEffects(
  message: string,
  reply: string,
  userInfo: Record<string, unknown> | null,
): void {
  // 지어내지 않고 "모른다"고 답한 질문 = 채워 넣어야 할 지식. 표시해서 수집으로 넘긴다.
  const unanswered = isUnanswered(reply)

  saveChatLog(message, reply, userInfo ?? undefined, unanswered).catch((err) =>
    logSideEffect('ChatLog', err),
  )
  sendQuestionAnswer(
    message,
    reply,
    userInfo ? JSON.stringify(userInfo) : undefined,
  ).catch((err) => logSideEffect('Webhook', err))
  if (isTelegramConfigured()) {
    sendTelegramMessage(formatChatNotification(message, reply, unanswered)).catch((err) =>
      logSideEffect('Telegram', err),
    )
  }
}
