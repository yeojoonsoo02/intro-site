import { buildKakaoTemplate, sendKakaoMemo } from './kakao'

// 사설/로컬 호스트 차단 패턴 — SSRF 표면 축소 (localhost, 루프백, 링크로컬, 사설 대역)
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/,
]

// 웹훅 URL을 https로 강제하고 사설/로컬 호스트를 차단해 SSRF를 방지
// 호스트 화이트리스트는 현실적으로 불가하므로 최소한의 검증만 수행
function isSafeWebhookUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'https:') return false
    const host = parsed.hostname
    if (PRIVATE_HOST_PATTERNS.some((re) => re.test(host))) return false
    return true
  } catch {
    console.warn('Invalid WEBSITE_CHAT_WEBHOOK_URL, skipping webhook')
    return false
  }
}

export async function sendQuestionAnswer(
  question: string,
  answer: string,
  userInfo?: string,
) {
  const webhook = process.env.WEBSITE_CHAT_WEBHOOK_URL
  const cleanAnswer = answer.replace(/\n+/g, ' ').trim()
  const template = buildKakaoTemplate(question, cleanAnswer)
  if (webhook && isSafeWebhookUrl(webhook)) {
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
