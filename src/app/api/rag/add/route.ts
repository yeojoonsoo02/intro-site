import { NextRequest, NextResponse } from 'next/server'
import { addKnowledge } from '@/lib/rag'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-admin-secret')
  const adminSecret = process.env.ADMIN_SECRET
  if (adminSecret && authHeader !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { text, category, lang } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "text" field' },
        { status: 400 },
      )
    }

    const id = await addKnowledge(text, category || 'custom', lang || 'ko')
    return NextResponse.json({ id })
  } catch (err) {
    console.error('Add knowledge error:', err)
    return NextResponse.json(
      { error: 'Failed to add knowledge' },
      { status: 500 },
    )
  }
}
