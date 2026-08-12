// --- Telegram types ---

export interface TelegramMessage {
  message_id: number
  date: number
  chat: { id: number }
  from?: { id: number; is_bot: boolean; first_name: string }
  text?: string
  reply_to_message?: TelegramMessage
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

// --- Config ---

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

function getApiUrl(method: string) {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`
}

export function isTelegramConfigured(): boolean {
  return !!(BOT_TOKEN && CHAT_ID)
}

// --- Shared utils ---

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// --- API ---

export async function sendTelegramMessage(
  text: string,
  replyToMessageId?: number,
): Promise<number | null> {
  if (!BOT_TOKEN || !CHAT_ID) return null

  try {
    const res = await fetch(getApiUrl('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        ...(replyToMessageId && { reply_to_message_id: replyToMessageId }),
      }),
    })
    const data = await res.json()
    return data.ok ? data.result.message_id : null
  } catch (err) {
    console.error('Telegram send error:', err)
    return null
  }
}

export function formatChatNotification(
  question: string,
  answer: string,
  unanswered = false,
): string {
  const q = escapeHtml(question)
  const a = escapeHtml(answer.length > 500 ? answer.slice(0, 500) + '...' : answer)
  // 못 답한 질문은 눈에 띄게 구분한다 — 이게 곧 채워 넣어야 할 지식 목록이다.
  const head = unanswered
    ? '<b>❓ 못 답한 질문</b>'
    : '<b>💬 새 질문</b>'
  const tail = unanswered
    ? '<i>답장하면 바로 지식이 됩니다. 나중에 /sync 로 반영하세요.</i>'
    : '<i>이 메시지에 답장하면 지식으로 저장됩니다.</i>'
  return `${head}\n\n<b>Q:</b> ${q}\n\n<b>A:</b> ${a}\n\n${tail}`
}
