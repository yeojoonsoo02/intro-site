import { NextRequest, NextResponse } from 'next/server'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'
import { checkRateLimit, checkDailyBudget, consumeDailyBudget } from '@/lib/rateLimit'
import { buildSystemPrompt } from './systemPrompt'
import { isBot, sanitizeUserInfo, resolveFallbackUrl } from './security'
import { fireSideEffects } from './sideEffects'

const MAX_MESSAGE_LENGTH = 2000
const FALLBACK_REPLY = '음.. 그건 좀 대답하기 어렵네. 다른 거 물어봐!'

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

const pickNumber = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (isBot(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 읽기 전용 예산 확인(차감 X) — 실제 차감은 모든 검증 통과 후 consumeDailyBudget으로.
  if (!(await checkDailyBudget())) {
    return NextResponse.json(
      { error: 'Daily limit reached. Please try again tomorrow.' },
      { status: 429 },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const message = body.message || body.prompt
  const userInfo = sanitizeUserInfo(body.userInfo)
  const email = userInfo?.email
  const isLoggedIn = typeof email === 'string' && email.length > 0

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimit = await checkRateLimit(ip, isLoggedIn)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', remaining: 0, isLoggedIn },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0' } },
    )
  }

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` },
      { status: 400 },
    )
  }

  // 모든 검증·per-IP 제한 통과 후 실제 외부 호출 직전에만 전역 예산 차감(빈/봇/초과 요청 방어)
  await consumeDailyBudget()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return await proxyToFallback(message, userInfo)
  }

  return await callGemini(apiKey, message, userInfo)
}

async function proxyToFallback(
  message: string,
  userInfo: Record<string, unknown> | null,
): Promise<NextResponse> {
  const url = resolveFallbackUrl()
  if (!url) {
    console.error(
      'Gemini API not configured: GEMINI_API_KEY missing and no allowed GEMINI_API_FALLBACK_URL',
    )
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  try {
    const systemPrompt = await buildSystemPrompt(message)
    const augmentedMessage = `${systemPrompt}\n\n### 사용자 질문:\n${message}`

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
      return NextResponse.json(
        { error: 'Invalid response from external API' },
        { status: 502 },
      )
    }
    const data = (await res.json()) as Record<string, unknown>
    const rawReply = data.reply ?? data.text
    const replyText = typeof rawReply === 'string' ? rawReply.trim() : ''
    const reply = replyText || FALLBACK_REPLY

    fireSideEffects(message, reply, userInfo)
    return NextResponse.json({
      reply,
      remaining: pickNumber(data.remaining) ?? pickNumber(data.count),
      limit: pickNumber(data.limit),
      used: pickNumber(data.used),
      reset: pickNumber(data.reset),
    })
  } catch (err) {
    console.error('Proxy error', err)
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
  }
}

async function callGemini(
  apiKey: string,
  message: string,
  userInfo: Record<string, unknown> | null,
): Promise<NextResponse> {
  try {
    const systemPrompt = await buildSystemPrompt(message)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      safetySettings: SAFETY_SETTINGS,
    })

    // Safety 차단(SAFETY/RECITATION/BLOCKLIST 등)일 때는 재시도하지 않음 — 재시도 리프레이밍으로 정책 우회 가능성 방지.
    // 네트워크·일시 오류만 1회 재시도.
    let reply = ''
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(message)
        const candidate = result.response.candidates?.[0]
        const finishReason = candidate?.finishReason
        if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
          console.warn(
            `Gemini blocked by safety: ${finishReason} for message length ${message.length}`,
          )
          break
        }
        reply = (result.response.text() ?? '').trim()
        if (reply) break
      } catch (retryErr) {
        console.warn(
          `Gemini attempt ${attempt} failed:`,
          retryErr instanceof Error ? retryErr.message : retryErr,
        )
      }
    }

    if (!reply) reply = FALLBACK_REPLY
    fireSideEffects(message, reply, userInfo)
    return NextResponse.json({ reply, remaining: null })
  } catch (err) {
    console.error('Gemini API error', err)
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
  }
}
