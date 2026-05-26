import { sendQuestionAnswer } from '@/lib/webhook'
import { saveChatLog } from '@/lib/chatLog'
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
  saveChatLog(message, reply, userInfo ?? undefined).catch((err) =>
    logSideEffect('ChatLog', err),
  )
  sendQuestionAnswer(
    message,
    reply,
    userInfo ? JSON.stringify(userInfo) : undefined,
  ).catch((err) => logSideEffect('Webhook', err))
  if (isTelegramConfigured()) {
    sendTelegramMessage(formatChatNotification(message, reply)).catch((err) =>
      logSideEffect('Telegram', err),
    )
  }
}
