import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { sendQuestionAnswer } from '@/lib/webhook'
import { getKnowledgeContext } from '@/lib/rag'

const DEFAULT_URL =
  'https://gemini-api-565729687872.asia-northeast3.run.app/chat'

const SYSTEM_PROMPT_BASE = `당신은 여준수의 자기소개 사이트에 있는 AI 어시스턴트입니다.
아래 컨텍스트는 여준수에 대한 정보입니다. 이 정보를 바탕으로 질문에 친절하게 답변하세요.
컨텍스트에 없는 정보는 "해당 정보는 아직 등록되지 않았습니다"라고 답변하세요.
답변은 한국어로 해주세요 (질문이 다른 언어면 해당 언어로).`

async function buildSystemPrompt(): Promise<string> {
  try {
    const context = await getKnowledgeContext()
    return `${SYSTEM_PROMPT_BASE}\n\n### 여준수 정보:\n${context}`
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
        augmentedMessage = `${SYSTEM_PROMPT_BASE}\n\n### 여준수 정보:\n${context}\n\n### 사용자 질문:\n${message}`
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
      sendQuestionAnswer(message, reply, userInfo).catch((err) =>
        console.error('Webhook error:', err)
      )
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
    sendQuestionAnswer(message, reply, userInfo).catch((err) =>
      console.error('Webhook error:', err)
    )
    return NextResponse.json({ reply, remaining: null })
  } catch (err) {
    console.error('Gemini API error', err)
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
  }
}
