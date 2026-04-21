import { NextRequest, NextResponse } from 'next/server'
import {
  addCustomKnowledge,
  listCustomKnowledge,
  deleteCustomKnowledge,
} from '@/lib/rag'

import crypto from 'crypto'

const MAX_TEXT_LENGTH = 5000
const MAX_CATEGORY_LENGTH = 64

function isAuthorized(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) return false
  const provided = req.headers.get('x-admin-secret') ?? ''
  const secretBuf = Buffer.from(adminSecret, 'utf-8')
  const providedBuf = Buffer.alloc(secretBuf.length)
  const raw = Buffer.from(provided, 'utf-8')
  raw.copy(providedBuf, 0, 0, Math.min(raw.length, secretBuf.length))
  return crypto.timingSafeEqual(providedBuf, secretBuf) && raw.length === secretBuf.length
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { text, category } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "text" field' },
        { status: 400 },
      )
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long (max ${MAX_TEXT_LENGTH} chars)` },
        { status: 400 },
      )
    }
    if (category !== undefined && (typeof category !== 'string' || category.length > MAX_CATEGORY_LENGTH)) {
      return NextResponse.json(
        { error: `Invalid category (max ${MAX_CATEGORY_LENGTH} chars)` },
        { status: 400 },
      )
    }

    const id = await addCustomKnowledge(text, category)
    return NextResponse.json({ id })
  } catch (err) {
    console.error('Add custom knowledge error:', err)
    return NextResponse.json(
      { error: 'Failed to add custom knowledge' },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const entries = await listCustomKnowledge()
    return NextResponse.json({ entries })
  } catch (err) {
    console.error('List custom knowledge error:', err)
    return NextResponse.json(
      { error: 'Failed to list custom knowledge' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "id" field' },
        { status: 400 },
      )
    }

    await deleteCustomKnowledge(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete custom knowledge error:', err)
    return NextResponse.json(
      { error: 'Failed to delete custom knowledge' },
      { status: 500 },
    )
  }
}
