'use client'

import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/AuthProvider'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
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
  const [remaining, setRemaining] = useState<number | null>(null)
  const [limitExhausted, setLimitExhausted] = useState(false)
  const idCounter = useRef(0)
  // 렌더 상태와 별개로 "지금까지 오간 대화"를 즉시 읽어야 해서 ref로도 들고 있는다.
  const historyRef = useRef<ChatMessage[]>([])

  const nextId = useCallback((): string => {
    idCounter.current += 1
    return `m${idCounter.current}`
  }, [])

  const append = useCallback(
    (role: ChatMessage['role'], text: string): string => {
      const id = nextId()
      const entry: ChatMessage = { id, role, text }
      historyRef.current = [...historyRef.current, entry]
      setMessages((m) => [...m, entry])
      return id
    },
    [nextId],
  )

  const updateText = useCallback((id: string, text: string): void => {
    historyRef.current = historyRef.current.map((m) => (m.id === id ? { ...m, text } : m))
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, text } : msg)))
  }, [])

  const send = useCallback(
    async (input: string): Promise<void> => {
      const prompt = input.trim()
      if (!prompt || loading) return

      // 이번 질문을 넣기 전의 대화가 맥락이다.
      const history = historyRef.current.slice(-HISTORY_LIMIT).map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }))

      append('user', prompt)
      setLoading(true)
      try {
        // 로그인 등급·식별은 서버에서 ID 토큰으로 검증한다. 위조 가능한 email 문자열은 보내지 않음.
        const idToken = user ? await user.getIdToken().catch(() => null) : null
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, idToken, history }),
        })
        if (!res.ok) {
          append('assistant', t('errorOccurred'))
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
          append('assistant', t('errorOccurred'))
          return
        }

        // 스트리밍 경로 — 도착하는 대로 붙여 보여준다.
        const id = append('assistant', '')
        setStreaming(true)
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let acc = ''
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

        if (!acc.trim()) updateText(id, t('errorOccurred'))
        if (Number.isFinite(headerRemaining)) applyRemaining(headerRemaining)
      } catch {
        append('assistant', t('errorOccurred'))
      } finally {
        setLoading(false)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('ai-chat'))
        }
      }

      function applyRemaining(value: number): void {
        setRemaining(value)
        if (value <= 0) setLimitExhausted(true)
      }
    },
    [append, loading, t, updateText, user],
  )

  return { messages, loading, streaming, remaining, limitExhausted, send }
}
