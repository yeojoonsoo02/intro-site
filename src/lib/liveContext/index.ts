import { formatLiveData } from './formatters'
import type { ContextResponse } from './types'

const API_URL = 'https://yeojoonsoo02-rust.vercel.app/api/external/context'
const TTL = 2 * 60 * 1000

let cached: string | null = null
let cacheTime = 0
let cachePromise: Promise<string> | null = null

async function fetchAndFormat(apiKey: string): Promise<string> {
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
      console.error('Live context API error:', res.status)
      return cached || ''
    }
    const json: ContextResponse = await res.json()
    if (!json.success) return cached || ''

    cached = formatLiveData(json)
    cacheTime = Date.now()
    return cached
  } catch (err) {
    console.error('Live context fetch error:', err)
    return cached || ''
  } finally {
    cachePromise = null
  }
}

export async function getLiveContext(): Promise<string> {
  const now = Date.now()
  if (cached && now - cacheTime < TTL) return cached
  if (cachePromise) return cachePromise

  const apiKey = process.env.CONTEXT_API_KEY
  if (!apiKey) return ''

  cachePromise = fetchAndFormat(apiKey)
  return cachePromise
}
