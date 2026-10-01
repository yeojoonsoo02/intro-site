'use client'

import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/AuthProvider'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  /** 오류 안내 말풍선. 화면에는 보이되 모델에게 보내는 대화 맥락에서는 뺀다. */
  error?: boolean
}

export interface UseChatReturn {
  messages: ChatMessage[]
  loading: boolean
  streaming: boolean
  remaining: number | null
  limitExhausted: boolean
  send: (text: string) => Promise<void>
}

// 서버가 최대 3턴까지만 받아들이므로 보내는 쪽에서도 6개로 맞춘다.
const HISTORY_LIMIT = 6

export function useChat(): UseChatReturn {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  // 한도는 계정(로그인) 또는 IP(게스트) 기준으로 따로 센다. 누구의 한도인지 함께 들고 있다가
  // 로그인·로그아웃으로 주인이 바뀌면 버린다 — 안 그러면 한도를 다 쓴 게스트가 로그인해도
  // 입력이 닫힌 채라 "로그인하면 더 질문할 수 있어요"가 거짓말이 된다.
  const [limit, setLimit] = useState<{ uid: string | null; remaining: number } | null>(null)
  const idCounter = useRef(0)
  // 렌더 상태와 별개로 "지금까지 오간 대화"를 즉시 읽어야 해서 ref로도 들고 있는다.
  const historyRef = useRef<ChatMessage[]>([])

  const uid = user?.uid ?? null
  const remaining = limit && limit.uid === uid ? limit.remaining : null
  const limitExhausted = remaining !== null && remaining <= 0

  const nextId = useCallback((): string => {
    idCounter.current += 1
    return `m${idCounter.current}`
  }, [])

  const append = useCallback(
    (role: ChatMessage['role'], text: string, error = false): string => {
      const id = nextId()
      const entry: ChatMessage = error ? { id, role, text, error } : { id, role, text }
      historyRef.current = [...historyRef.current, entry]
      setMessages((m) => [...m, entry])
      return id
    },
    [nextId],
  )

  const updateText = useCallback((id: string, text: string, error = false): void => {
    const patch = (m: ChatMessage): ChatMessage =>
      m.id === id ? (error ? { ...m, text, error } : { ...m, text }) : m
    historyRef.current = historyRef.current.map(patch)
    setMessages((m) => m.map(patch))
  }, [])

  const send = useCallback(
    async (input: string): Promise<void> => {
      const prompt = input.trim()
      if (!prompt || loading) return

      // 이번 질문을 넣기 전의 대화가 맥락이다. 오류 안내는 내 답변이 아니므로 보내지 않는다.
      const history = historyRef.current
        .filter((m) => !m.error)
        .slice(-HISTORY_LIMIT)
        .map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('model' as const),
          text: m.text,
        }))

      append('user', prompt)
      setLoading(true)
      // 스트리밍 중 끊겼을 때 빈 말풍선을 오류 안내로 바꾸려면 밖에서 알아야 한다.
      let streamId: string | null = null
      let acc = ''
      try {
        // 로그인 등급·식별은 서버에서 ID 토큰으로 검증한다. 위조 가능한 email 문자열은 보내지 않음.
        const idToken = user ? await user.getIdToken().catch(() => null) : null
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, idToken, history }),
        })
        if (res.status === 429) {
          // 한도 초과(내 질문 횟수 또는 사이트 일일 예산). 일반 오류로 보여주면 계속 다시 시도하게 된다.
          applyRemaining(0)
          return
        }
        if (!res.ok) {
          append('assistant', t('errorOccurred'), true)
          return
        }

        const headerRemaining = Number(res.headers.get('X-RateLimit-Remaining'))
        const contentType = res.headers.get('content-type') ?? ''

        if (contentType.includes('application/json')) {
          // 외부 fallback 서비스 경로 — 한 번에 오는 JSON.
          const data = await res.json()
          const reply = data.reply || data.text
          if (reply) append('assistant', reply)
          if (typeof data.remaining === 'number') applyRemaining(data.remaining)
          return
        }

        if (!res.body) {
          append('assistant', t('errorOccurred'), true)
          return
        }

        // 스트리밍 경로 — 도착하는 대로 붙여 보여준다.
        const id = append('assistant', '')
        streamId = id
        setStreaming(true)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        try {
          for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            acc += decoder.decode(value, { stream: true })
            updateText(id, acc)
          }
          acc += decoder.decode()
          updateText(id, acc)
        } finally {
          setStreaming(false)
        }

        if (!acc.trim()) updateText(id, t('errorOccurred'), true)
        if (Number.isFinite(headerRemaining)) applyRemaining(headerRemaining)
      } catch {
        // 받은 내용이 없으면 빈 말풍선을 오류 안내로 바꾸고, 일부라도 받았으면 그건 두고 안내를 덧붙인다.
        if (streamId && !acc.trim()) updateText(streamId, t('errorOccurred'), true)
        else append('assistant', t('errorOccurred'), true)
      } finally {
        setLoading(false)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('ai-chat'))
        }
      }

      function applyRemaining(value: number): void {
        // 요청을 보낸 시점의 주인으로 기록한다. 응답을 기다리는 사이 로그인 상태가 바뀌었으면
        // 지금 주인과 달라 자연히 무시된다.
        setLimit({ uid, remaining: value })
      }
    },
    [append, loading, t, uid, updateText, user],
  )

  return { messages, loading, streaming, remaining, limitExhausted, send }
}
