import type { NextRequest } from 'next/server'

const BOT_UA_PATTERNS =
  /bot|crawl|spider|scrape|headless|phantom|selenium|puppeteer|playwright|wget|curl|httpie|python-requests|node-fetch|axios|go-http|java\//i

// fallback Gemini API 호스트 화이트리스트 — env 오설정 시 임의 호스트로 SSRF 차단
const ALLOWED_FALLBACK_HOSTS = new Set<string>([
  'gemini-api-565729687872.asia-northeast3.run.app',
])

export function isBot(req: NextRequest): boolean {
  const ua = req.headers.get('user-agent') || ''
  if (!ua || ua.length < 10) return true
  if (BOT_UA_PATTERNS.test(ua)) return true
  const accept = req.headers.get('accept') || ''
  const origin = req.headers.get('origin') || ''
  const referer = req.headers.get('referer') || ''
  if (!origin && !referer) return true
  if (!accept.includes('json') && !accept.includes('*/*')) return true
  return false
}

export function sanitizeUserInfo(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const raw = data as Record<string, unknown>
  const safe: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      safe[key] = val
    }
  }
  return Object.keys(safe).length > 0 ? safe : null
}

export function resolveFallbackUrl(): string | null {
  const url = process.env.GEMINI_API_FALLBACK_URL
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') return null
    if (!ALLOWED_FALLBACK_HOSTS.has(parsed.hostname)) return null
    return parsed.toString()
  } catch {
    return null
  }
}
