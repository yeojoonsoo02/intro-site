export async function sendQuestionAnswer(question: string, answer: string) {
  const webhook = process.env.WEBSITE_CHAT_WEBHOOK_URL
  if (!webhook) return
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
    })
  } catch (err) {
    console.error('Failed to send webhook:', err)
  }
}
