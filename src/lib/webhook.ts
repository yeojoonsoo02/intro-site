import { buildKakaoTemplate, sendKakaoMemo } from './kakao'

export async function sendQuestionAnswer(
  question: string,
  answer: string,
  userInfo?: string,
) {
  const webhook = process.env.WEBSITE_CHAT_WEBHOOK_URL
  const cleanAnswer = answer.replace(/\n+/g, ' ').trim()
  const template = buildKakaoTemplate(question, cleanAnswer)
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer: cleanAnswer,
          userInfo,
          timestamp: new Date().toISOString(),
          template_object: JSON.stringify(template),
        }),
      })
    } catch (err) {
      console.error('Failed to send webhook:', err)
    }
  }
  await sendKakaoMemo(template)
}
