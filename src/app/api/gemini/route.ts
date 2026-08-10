import { NextRequest, NextResponse } from 'next/server'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'
import { checkRateLimit, checkDailyBudget, consumeDailyBudget } from '@/lib/rateLimit'
import { adminAuth } from '@/lib/firebaseAdmin'
import { buildSystemPrompt } from './systemPrompt'
import { isBot, resolveFallbackUrl } from './security'
import { fireSideEffects } from './sideEffects'
import { sanitizeHistory, formatHistoryForPrompt, type HistoryTurn } from './history'

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

  // 로그인 등급·식별을 서버에서 Firebase ID 토큰으로 검증한다. 클라이언트가 보낸 email
  // 문자열은 더 이상 신뢰하지 않음(한도 위조·강등 방지). 토큰 없거나 위조/만료면 게스트로 처리.
  let verifiedUser: { uid: string; email: string } | null = null
  const idToken = typeof body.idToken === 'string' ? body.idToken : null
  if (idToken && adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken)
      verifiedUser = { uid: decoded.uid, email: decoded.email ?? '' }
    } catch {
      verifiedUser = null
    }
  }
  const isLoggedIn = !!verifiedUser
  const userInfo = verifiedUser
    ? { uid: verifiedUser.uid, email: verifiedUser.email }
    : null

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  // 로그인 사용자는 uid 기준으로 제한(IP 공유 환경에서도 정확). 게스트는 IP 기준.
  const rateLimitKey = verifiedUser ? `uid_${verifiedUser.uid}` : ip
  const rateLimit = await checkRateLimit(rateLimitKey, isLoggedIn)
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

  // 최근 대화(최대 3턴). 클라이언트 입력이므로 역할 순서·길이·개수를 서버에서 강제한다.
  const history = sanitizeHistory(body.history)

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return await proxyToFallback(message, userInfo, rateLimit.remaining, history)
  }

  return await callGemini(apiKey, message, userInfo, rateLimit.remaining, history)
}

async function proxyToFallback(
  message: string,
  userInfo: Record<string, unknown> | null,
  remaining: number,
  history: HistoryTurn[],
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
    // 외부 서비스는 단일 문자열만 받으므로 대화 맥락을 텍스트로 풀어 붙인다.
    const recent = formatHistoryForPrompt(history)
    const augmentedMessage = recent
      ? `${systemPrompt}\n\n### 최근 대화:\n${recent}\n\n### 사용자 질문:\n${message}`
      : `${systemPrompt}\n\n### 사용자 질문:\n${message}`

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
      // 외부 서비스가 자체 카운터를 주면 그것을, 아니면 우리 rate limit 잔여 횟수를 쓴다.
      remaining: pickNumber(data.remaining) ?? pickNumber(data.count) ?? remaining,
      limit: pickNumber(data.limit),
      used: pickNumber(data.used),
      reset: pickNumber(data.reset),
    })
  } catch (err) {
    console.error('Proxy error', err)
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
  }
}

// 응답을 통째로 기다렸다가 한 번에 내려주면 RAG·컨텍스트 준비 시간까지 더해져
// 체감 대기가 길다. 토큰 과금은 동일하므로 스트리밍이 순수 이득이다.
async function callGemini(
  apiKey: string,
  message: string,
  userInfo: Record<string, unknown> | null,
  remaining: number,
  history: HistoryTurn[],
): Promise<NextResponse> {
  try {
    const systemPrompt = await buildSystemPrompt(message)
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      safetySettings: SAFETY_SETTINGS,
    })
    const chat = model.startChat({ history })

    // 네트워크·일시 오류만 1회 재시도. Safety 차단은 재시도하지 않는다 —
    // 리프레이밍으로 정책을 우회하게 되는 걸 막기 위함.
    let stream: Awaited<ReturnType<typeof chat.sendMessageStream>> | null = null
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        stream = await chat.sendMessageStream(message)
        break
      } catch (retryErr) {
        console.warn(
          `Gemini attempt ${attempt} failed:`,
          retryErr instanceof Error ? retryErr.message : retryErr,
        )
      }
    }

    if (!stream) {
      fireSideEffects(message, FALLBACK_REPLY, userInfo)
      return textResponse(FALLBACK_REPLY, remaining)
    }

    const encoder = new TextEncoder()
    const activeStream = stream
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let full = ''
        try {
          for await (const chunk of activeStream.stream) {
            // safety 차단 시 text()가 던진다 — 그 시점까지 받은 내용은 그대로 둔다.
            let piece = ''
            try {
              piece = chunk.text() ?? ''
            } catch (chunkErr) {
              console.warn(
                'Gemini chunk blocked:',
                chunkErr instanceof Error ? chunkErr.message : chunkErr,
              )
              break
            }
            if (!piece) continue
            full += piece
            controller.enqueue(encoder.encode(piece))
          }
        } catch (streamErr) {
          console.error('Gemini stream error', streamErr)
        }

        // 빈 응답은 절대 내보내지 않는다(시스템 프롬프트의 절대 규칙과 동일한 취지).
        if (!full.trim()) {
          full = FALLBACK_REPLY
          controller.enqueue(encoder.encode(full))
        }
        controller.close()
        fireSideEffects(message, full.trim(), userInfo)
      },
    })

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-RateLimit-Remaining': String(remaining),
        'Cache-Control': 'no-store',
        // 프록시가 스트림을 모아뒀다 한 번에 흘리는 것을 막는다.
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err) {
    console.error('Gemini API error', err)
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
  }
}

function textResponse(text: string, remaining: number): NextResponse {
  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-RateLimit-Remaining': String(remaining),
      'Cache-Control': 'no-store',
    },
  })
}
