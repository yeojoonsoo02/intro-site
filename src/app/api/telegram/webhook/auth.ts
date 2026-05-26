import crypto from 'crypto'
import type { NextRequest } from 'next/server'

export function verifyTelegramRequest(req: NextRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret) return false
  const token = req.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? ''
  // 길이가 달라도 항상 동일한 길이의 비교를 수행해 timing leak 방지.
  const secretBuf = Buffer.from(secret, 'utf-8')
  const tokenBuf = Buffer.alloc(secretBuf.length)
  const rawBuf = Buffer.from(token, 'utf-8')
  rawBuf.copy(tokenBuf, 0, 0, Math.min(rawBuf.length, secretBuf.length))
  const equal = crypto.timingSafeEqual(tokenBuf, secretBuf)
  return equal && rawBuf.length === secretBuf.length
}
