// 클라이언트가 보낸 최근 대화를 검증해 Gemini가 받는 형식으로 바꾼다.
//
// 클라이언트 입력이므로 그대로 믿지 않는다. 길이·개수·역할 순서를 모두 강제해야
// 프롬프트 주입이나 토큰 폭증(비용)으로 이어지지 않는다.

export interface HistoryTurn {
  role: 'user' | 'model'
  parts: { text: string }[]
}

// 3턴 = user/model 6개. 후속 질문("그거 더 자세히", "왜?")을 받아주기엔 충분하고
// 입력 토큰 증가는 작게 유지된다.
const MAX_TURNS = 3
const MAX_ENTRIES = MAX_TURNS * 2
const MAX_ENTRY_LENGTH = 1000

/** 클라이언트가 창(3턴)보다 많은 대화를 보냈는지 — 모델이 "기억이 잘린 것"을 알아야 단언하지 않는다. */
export function wasHistoryTruncated(raw: unknown): boolean {
  return Array.isArray(raw) && raw.length > MAX_ENTRIES
}

export function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return []

  const cleaned: HistoryTurn[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const { role, text } = entry as { role?: unknown; text?: unknown }
    if (role !== 'user' && role !== 'model') continue
    if (typeof text !== 'string') continue
    const trimmed = text.trim().slice(0, MAX_ENTRY_LENGTH)
    if (!trimmed) continue
    cleaned.push({ role, parts: [{ text: trimmed }] })
  }

  // 최근 것부터 남긴다.
  const recent = cleaned.slice(-MAX_ENTRIES)

  // Gemini는 history가 user로 시작하고 역할이 번갈아야 한다.
  // 어긋나면 조용히 틀리는 대신 앞부분을 잘라 규칙을 맞춘다.
  const start = recent.findIndex((h) => h.role === 'user')
  if (start === -1) return []

  const result: HistoryTurn[] = []
  for (const turn of recent.slice(start)) {
    const last = result[result.length - 1]
    if (last && last.role === turn.role) continue
    result.push(turn)
  }

  // 마지막이 user면 그 뒤에 이번 질문이 또 user로 붙어 연속이 된다. 잘라낸다.
  if (result[result.length - 1]?.role === 'user') result.pop()

  return result
}

/** 외부 fallback 서비스는 단일 문자열만 받으므로 대화를 텍스트로 풀어 붙인다. */
export function formatHistoryForPrompt(history: HistoryTurn[]): string {
  if (history.length === 0) return ''
  const lines = history.map((h) => {
    const who = h.role === 'user' ? '상대' : '나'
    return `${who}: ${h.parts[0].text}`
  })
  return lines.join('\n')
}
