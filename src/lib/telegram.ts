const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

function getApiUrl(method: string) {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`
}

export function isTelegramConfigured(): boolean {
  return !!(BOT_TOKEN && CHAT_ID)
}

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
): string {
  const q = escapeHtml(question)
  const a = escapeHtml(answer.length > 500 ? answer.slice(0, 500) + '...' : answer)
  return `<b>💬 새 질문</b>\n\n<b>Q:</b> ${q}\n\n<b>A:</b> ${a}\n\n<i>이 메시지에 답장하면 지식으로 저장됩니다.</i>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
