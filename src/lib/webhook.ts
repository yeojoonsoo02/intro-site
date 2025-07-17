import { sendKakaoMemo } from './kakao'

export async function sendQuestionAnswer(
  question: string,
  answer: string,
  userInfo?: string,
) {
  const webhook = process.env.WEBSITE_CHAT_WEBHOOK_URL
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          userInfo,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (err) {
      console.error('Failed to send webhook:', err)
    }
  }
  await sendKakaoMemo(question, answer)
}
