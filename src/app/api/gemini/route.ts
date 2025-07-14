import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const DEFAULT_URL =
  'https://gemini-api-565729687872.asia-northeast3.run.app/chat'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const message = body.message || body.prompt
  if (!message) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
  }
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    // If no API key, forward to external server
    const url = process.env.NEXT_PUBLIC_GEMINI_API_URL ?? DEFAULT_URL
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      const reply = data.reply ?? data.text
      const remaining = data.remaining ?? data.count
      const limit = data.limit
      const used = data.used
      const reset = data.reset
      try {
        await fetch(
          'http://localhost:5678/webhook-test/website-chat-webhook',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: message, answer: reply }),
          }
        )
      } catch (err) {
        console.error('Failed to send webhook:', err)
      }
      return NextResponse.json({ reply, remaining, limit, used, reset })
    } catch (err) {
      console.error('Proxy error', err)
      return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const result = await model.generateContent(message)
    const reply = result.response.text()
    try {
      await fetch(
        'http://localhost:5678/webhook-test/website-chat-webhook',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: message, answer: reply }),
        }
      )
    } catch (err) {
      console.error('Failed to send webhook:', err)
    }
    return NextResponse.json({ reply, remaining: null })
  } catch (err) {
    console.error('Gemini API error', err)
    return NextResponse.json({ error: 'Failed to fetch response' }, { status: 500 })
  }
}
