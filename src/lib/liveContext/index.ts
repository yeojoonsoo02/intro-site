import { cached } from '@/lib/cached'
import { formatLiveData } from './formatters'
import type { ContextResponse } from './types'

const API_URL = 'https://yeojoonsoo02-rust.vercel.app/api/external/context'
const TTL = 2 * 60 * 1000
const ERROR_TTL = 30 * 1000
// 응답이 없으면 그 사이 들어온 챗 요청이 전부 같은 호출을 기다리며 멈춘다(cached가 호출을 합친다).
const TIMEOUT_MS = 5000

async function load(): Promise<string> {
  const apiKey = process.env.CONTEXT_API_KEY
  if (!apiKey) return ''
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Live context API ${res.status}`)
  const json: ContextResponse = await res.json()
  if (!json.success) throw new Error('Live context API returned success=false')
  return formatLiveData(json)
}

export const getLiveContext = cached(load, '', { ttl: TTL, errorTtl: ERROR_TTL, name: 'liveContext' })
