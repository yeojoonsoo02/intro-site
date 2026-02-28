import { NextRequest, NextResponse } from 'next/server'
import { seedKnowledge } from '@/lib/rag'

export async function POST(req: NextRequest) {
  // Simple secret-based auth for admin-only endpoint
  const authHeader = req.headers.get('x-admin-secret')
  const adminSecret = process.env.ADMIN_SECRET
  if (adminSecret && authHeader !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const lang = body.lang as string | undefined

    const count = await seedKnowledge(lang)
    const langs = lang ? [lang] : ['ko', 'en', 'ja', 'zh']

    return NextResponse.json({ count, langs })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json(
      { error: 'Failed to seed knowledge base' },
      { status: 500 },
    )
  }
}
