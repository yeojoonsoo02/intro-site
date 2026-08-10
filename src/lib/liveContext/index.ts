import { formatLiveData } from './formatters'
import type { ContextResponse } from './types'

const API_URL = 'https://yeojoonsoo02-rust.vercel.app/api/external/context'
const TTL = 2 * 60 * 1000
const ERROR_TTL = 30 * 1000 // 외부 API 실패 시 재시도 간격

// 만료 시각으로 관리한다. cached의 truthy 여부로 판정하면 포맷 결과가 빈 문자열일 때
// TTL이 무시돼 채팅 요청마다 외부 API를 재호출한다.
let cached: string | null = null
let cacheExpiry = 0
let cachePromise: Promise<string> | null = null

// 실패 시 직전 값(없으면 빈 값)을 짧게 유지해 장애 중 반복 호출을 막는다.
function holdOnFailure(): string {
  const fallback = cached ?? ''
  cached = fallback
  cacheExpiry = Date.now() + ERROR_TTL
  return fallback
}

async function fetchAndFormat(apiKey: string): Promise<string> {
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
      console.error('Live context API error:', res.status)
      return holdOnFailure()
    }
    const json: ContextResponse = await res.json()
    if (!json.success) return holdOnFailure()

    cached = formatLiveData(json)
    cacheExpiry = Date.now() + TTL
    return cached
  } catch (err) {
    console.error('Live context fetch error:', err)
    return holdOnFailure()
  } finally {
    cachePromise = null
  }
}

export async function getLiveContext(): Promise<string> {
  if (cached !== null && Date.now() < cacheExpiry) return cached
  if (cachePromise) return cachePromise

  const apiKey = process.env.CONTEXT_API_KEY
  if (!apiKey) return ''

  cachePromise = fetchAndFormat(apiKey)
  return cachePromise
}
