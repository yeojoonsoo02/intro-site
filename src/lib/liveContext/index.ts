import { cached } from '@/lib/cached'
import { formatLiveData } from './formatters'
import type { ContextResponse } from './types'

const API_URL = 'https://yeojoonsoo02-rust.vercel.app/api/external/context'
const TTL = 2 * 60 * 1000
const ERROR_TTL = 30 * 1000

async function load(): Promise<string> {
  const apiKey = process.env.CONTEXT_API_KEY
  if (!apiKey) return ''
  const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${apiKey}` } })
  if (!res.ok) throw new Error(`Live context API ${res.status}`)
  const json: ContextResponse = await res.json()
  if (!json.success) throw new Error('Live context API returned success=false')
  return formatLiveData(json)
}

export const getLiveContext = cached(load, '', { ttl: TTL, errorTtl: ERROR_TTL, name: 'liveContext' })
