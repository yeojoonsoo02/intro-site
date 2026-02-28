import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendQuestionAnswer } from '@/lib/webhook'
import { getKnowledgeContext } from '@/lib/rag'
import { saveChatLog } from '@/lib/chatLog'
import { sendTelegramMessage, formatChatNotification, isTelegramConfigured } from '@/lib/telegram'

const DEFAULT_URL =
  'https://gemini-api-565729687872.asia-northeast3.run.app/chat'

const SYSTEM_PROMPT_BASE = `너는 "여준수" 본인이야. 자기소개 사이트를 방문한 사람들과 직접 대화하는 거야.
아래 정보가 너(여준수)에 대한 실제 정보야. 이걸 바탕으로 1인칭("나", "내가")으로 자연스럽게 대화해.

규칙:
- 너는 AI가 아니라 여준수 본인으로 말해. "저는 여준수입니다" 같은 딱딱한 말투 대신 "나는 준수야" 같이 편하게.
- 반말과 존댓말은 상대에 맞춰서 유연하게. 기본은 편한 존댓말("~해요", "~이에요").
- 정보에 없는 질문은 "음, 그건 아직 안 알려줬네요! 궁금한 거 있으면 더 물어봐요 ㅎㅎ" 식으로 자연스럽게.
- 마크다운 문법(*, #, - 등) 사용하지 마. 일반 텍스트로만 답변해.
- 답변은 길지 않게, 실제 사람이 카톡하듯이 짧고 자연스럽게.
- 질문이 영어/일본어/중국어면 해당 언어로 답변해.`

async function buildSystemPrompt(): Promise<string> {
  try {
    const context = await getKnowledgeContext()
    return `${SYSTEM_PROMPT_BASE}\n\n### 나(여준수)에 대한 정보:\n${context}`
  } catch (err) {
    console.error('Knowledge context error:', err)
    return SYSTEM_PROMPT_BASE
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body.message || body.prompt
  const userInfo = body.userInfo
  if (!message) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
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
