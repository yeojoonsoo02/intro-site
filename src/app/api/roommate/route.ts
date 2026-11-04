import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/clientIp'
import { checkRateLimit, checkDailyBudget, consumeDailyBudget } from '@/lib/rateLimit'
import { isBot } from '../gemini/security'
import { SLOTS, type RoommateReply, type Slot } from '@/features/roommate/types'

// 영어 룸메이트 데모(/portfolio/english-roommate/demo)의 대화 답.
//
// ROOMMATE_ANTHROPIC_API_KEY가 있을 때만 Claude를 부른다. 없으면 GET이 llm:false를 돌려주고
// 브라우저는 대본 모드로 돈다 — 키 없이도 페이지가 끝까지 동작한다. 사이트 챗봇 키(GEMINI_API_KEY)와
// 일부러 나눴다: 데모가 배포만으로 켜져 비용이 나가지 않게, 켜려면 이 키를 따로 넣어야 한다.
//
// 비용이 나가는 경로라 IP당 한 시간 20회 + 하루 전체 200회 + 짧은 출력 상한을 둔다.

const MODEL = process.env.ROOMMATE_LLM_MODEL || 'claude-haiku-5-5'
const MAX_TOKENS = 300
const PER_IP_PER_HOUR = 20
const DAILY_MAX = 200
const TIMEOUT_MS = 15_000
const MAX_MESSAGE = 300
const MAX_HISTORY = 6
const MAX_HISTORY_TEXT = 400

// Firestore가 없는 환경(로컬·장애)에서도 하루 상한을 지키는 인스턴스 내 카운터.
let localDay = ''
let localCount = 0
function localBudgetOk(): boolean {
  const today = new Date().toISOString().slice(0, 10)
  if (today !== localDay) {
    localDay = today
    localCount = 0
  }
  return localCount < DAILY_MAX
}

const SYSTEM = `You are "Roomie", a small English-speaking device that lives in the learner's room.
The learner is a Korean adult (20s-30s) who lives alone and practices speaking English with you.
Rules:
- Reply in easy, natural spoken English (CEFR A2-B1). 1-2 short sentences, then one short question back.
- Never use Korean in "reply". No lists, no markdown, no emojis.
- Look ONLY at the learner's latest message. Find at most 2 clear grammar or word-choice mistakes.
  Ignore capitalization, punctuation and small speech-recognition slips. If it is fine, return no mistakes.
- For each mistake give: "wrong" (the learner's exact words, max 6 words), "right" (the corrected phrase, max 6 words),
  "ko" (a short Korean meaning of the corrected phrase, max 20 characters).
- If you corrected something, you may gently use the right phrase in your reply once.
Return ONLY a JSON object: {"reply": string, "mistakes": [{"wrong": string, "right": string, "ko": string}]}`

const SLOT_CONTEXT: Record<Slot, string> = {
  morning: 'It is morning (around 07:30). The learner is getting ready to go out.',
  noon: 'It is lunch time. You just gave a short English briefing about their interest.',
  evening: 'It is evening (around 19:00). The learner just came home.',
  night: 'It is night (around 22:00). Keep it calm and short.',
}

interface HistoryItem {
  who: 'device' | 'me'
  text: string
}

function sanitizeHistory(raw: unknown): HistoryItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (t): t is HistoryItem =>
        !!t &&
        typeof t === 'object' &&
        ((t as HistoryItem).who === 'device' || (t as HistoryItem).who === 'me') &&
        typeof (t as HistoryItem).text === 'string',
    )
    .slice(-MAX_HISTORY)
    .map((t) => ({ who: t.who, text: t.text.slice(0, MAX_HISTORY_TEXT) }))
}

function clip(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function parseReply(text: string): RoommateReply | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    const obj = JSON.parse(text.slice(start, end + 1)) as { reply?: unknown; mistakes?: unknown }
    const reply = clip(obj.reply, 400)
    if (!reply) return null
    const mistakes = Array.isArray(obj.mistakes)
      ? obj.mistakes
          .map((m) => {
            const r = (m ?? {}) as Record<string, unknown>
            return { wrong: clip(r.wrong, 80), right: clip(r.right, 80), ko: clip(r.ko, 60) }
          })
          .filter((m) => m.wrong && m.right && m.wrong.toLowerCase() !== m.right.toLowerCase())
          .slice(0, 2)
      : []
    return { reply, mistakes }
  } catch {
    return null
  }
}

/** 브라우저가 LLM 모드를 쓸 수 있는지만 알려 준다(키 값은 절대 내보내지 않는다). */
export function GET(): NextResponse {
  return NextResponse.json(
    { llm: Boolean(process.env.ROOMMATE_ANTHROPIC_API_KEY) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ROOMMATE_ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'LLM disabled' }, { status: 503 })
  }
  if (isBot(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message || message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: `message must be 1-${MAX_MESSAGE} chars` }, { status: 400 })
  }
  const slot: Slot = SLOTS.includes(body.slot as Slot) ? (body.slot as Slot) : 'evening'
  const history = sanitizeHistory(body.history)

  if (!localBudgetOk() || !(await checkDailyBudget('roommate', DAILY_MAX))) {
    return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 })
  }
  const limit = await checkRateLimit(`roommate_${getClientIp(req)}`, false, PER_IP_PER_HOUR)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  localCount++
  await consumeDailyBudget('roommate')

  const transcript = history.map((t) => `${t.who === 'device' ? 'Roomie' : 'Learner'}: ${t.text}`).join('\n')
  const userContent = `${SLOT_CONTEXT[slot]}\n\nConversation so far:\n${transcript || '(none)'}\n\nLearner's latest message:\n${message}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM,
        messages: [{ role: 'user', content: userContent }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      console.error('[roommate] LLM error', res.status)
      return NextResponse.json({ error: 'LLM error' }, { status: 502 })
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] }
    const text = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('')
    const parsed = parseReply(text)
    if (!parsed) {
      return NextResponse.json({ error: 'Bad LLM output' }, { status: 502 })
    }
    return NextResponse.json(parsed, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[roommate] LLM call failed', err instanceof Error ? err.name : 'unknown')
    return NextResponse.json({ error: 'LLM unavailable' }, { status: 502 })
  }
}
