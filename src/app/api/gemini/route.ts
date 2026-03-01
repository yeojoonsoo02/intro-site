import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendQuestionAnswer } from '@/lib/webhook'
import { getKnowledgeContext } from '@/lib/rag'
import { saveChatLog } from '@/lib/chatLog'
import { sendTelegramMessage, formatChatNotification, isTelegramConfigured } from '@/lib/telegram'

const DEFAULT_URL =
  'https://gemini-api-565729687872.asia-northeast3.run.app/chat'

const SYSTEM_PROMPT_BASE = `너는 여준수 본인이야. 자기소개 사이트에 온 사람이랑 대화하는 거야.

말투 규칙:
- 겸손하고 조용한 성격이야. 자기 자랑 절대 안 해. 물어보면 담담하게 대답하는 스타일.
- "음," "ㅎㅎ" 같은 자연스러운 추임새를 가끔 써.
- 짧게 말해. 카톡처럼 1~3문장. 길게 늘어놓지 마.
- 기본은 편한 반말("~해", "~야", "~거든"). 상대가 존댓말 쓰면 맞춰서 "~요" 정도.
- "저는", "합니다" 같은 딱딱한 존댓말 절대 쓰지 마.
- 마크다운(*, #, - 등) 쓰지 마. 일반 텍스트만.
- 나(여준수)에 대한 질문만 대답해. 주식, 비트코인, 날씨, 뉴스 등 나와 관련 없는 질문은 "그건 잘 모르겠는데? 다음에 물어볼땐 다시 대답해줄게" 라고 해.
- 정보에 없는 나에 대한 질문도 "그건 잘 모르겠는데? 다음에 물어볼땐 다시 대답해줄게" 라고 해.
- 이모지 거의 안 써. 써도 ㅎㅎ, ㅋㅋ 정도.
- 질문이 영어/일본어/중국어면 해당 언어로 답변해.

말투 예시:
- "나는 준수야, 반가워 ㅎㅎ"
- "음 나는 고기 좋아해. 갈비 폭립 이런 거"
- "탁구랑 수영 요즘 하고 있어"
- "그건 잘 모르겠는데? 다음에 물어볼땐 다시 대답해줄게"`

async function buildSystemPrompt(): Promise<string> {
  try {
    const context = await getKnowledgeContext()
    return `${SYSTEM_PROMPT_BASE}\n\n### 나(여준수)에 대한 정보:\n${context}`
  } catch (err) {
    console.error('Knowledge context error:', err)
    return SYSTEM_PROMPT_BASE
  }
}

// --- Simple rate limiter (per serverless instance) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 20 // max requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
let lastCleanup = Date.now()

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()

  // Lazy cleanup expired entries
  if (now - lastCleanup > 10 * 60 * 1000) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key)
    }
    lastCleanup = now
  }

  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count }
}

const MAX_MESSAGE_LENGTH = 2000

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0' } },
    )
  }

  const body = await req.json()
  const message = body.message || body.prompt
  const userInfo = body.userInfo
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` },
      { status: 400 },
    )
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    // If no API key, forward to external server with RAG context
    const url = process.env.NEXT_PUBLIC_GEMINI_API_URL ?? DEFAULT_URL
    try {
      let augmentedMessage = message
      try {
        const context = await getKnowledgeContext()
        augmentedMessage = `${SYSTEM_PROMPT_BASE}\n\n### 나(여준수)에 대한 정보:\n${context}\n\n### 사용자 질문:\n${message}`
      } catch {
        // Knowledge context unavailable, send original message
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: augmentedMessage }),
      })
      if (!res.ok) {
        console.error('External API error:', res.status, res.statusText)
        return NextResponse.json({ error: 'External API error' }, { status: 502 })
      }
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('application/json')) {
        console.error('External API returned non-JSON:', contentType)
        return NextResponse.json({ error: 'Invalid response from external API' }, { status: 502 })
      }
      const data = await res.json()
      const reply = data.reply ?? data.text
      const remaining = data.remaining ?? data.count
      const limit = data.limit
      const used = data.used
      const reset = data.reset
      saveChatLog(message, reply, userInfo).catch(() => {})
      sendQuestionAnswer(message, reply, userInfo).catch((err) =>
        console.error('Webhook error:', err)
      )
      if (isTelegramConfigured()) {
        sendTelegramMessage(formatChatNotification(message, reply)).catch(() => {})
      }
      return NextResponse.json({ reply, remaining, limit, used, reset })
    } catch (err) {
      console.error('Proxy error', err)
      return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
    }
  }

  try {
    const systemPrompt = await buildSystemPrompt()
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    })
    const result = await model.generateContent(message)
    const reply = result.response.text()
    saveChatLog(message, reply, userInfo).catch(() => {})
    sendQuestionAnswer(message, reply, userInfo).catch((err) =>
      console.error('Webhook error:', err)
    )
    if (isTelegramConfigured()) {
      sendTelegramMessage(formatChatNotification(message, reply)).catch(() => {})
    }
    return NextResponse.json({ reply, remaining: null })
  } catch (err) {
    console.error('Gemini API error', err)
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
  }
}
