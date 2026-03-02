import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ success: false }, { status: 403 })
    }

    const inputBuf = Buffer.from(password)
    const secretBuf = Buffer.from(adminPassword)

    if (inputBuf.length !== secretBuf.length) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    const match = crypto.timingSafeEqual(inputBuf, secretBuf)

    if (!match) {
      return NextResponse.json({ success: false }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
