'use client'

import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/AuthProvider'
import { savePrompt } from './prompt.api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

export interface UseChatReturn {
  messages: ChatMessage[]
  loading: boolean
  remaining: number | null
  limitExhausted: boolean
  send: (text: string) => Promise<void>
}

export function useChat(): UseChatReturn {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [limitExhausted, setLimitExhausted] = useState(false)
  const idCounter = useRef(0)

  const nextId = useCallback((): string => {
    idCounter.current += 1
    return `m${idCounter.current}`
  }, [])

  const append = useCallback(
    (role: ChatMessage['role'], text: string): void => {
      setMessages((m) => [...m, { id: nextId(), role, text }])
    },
    [nextId],
  )

  const send = useCallback(
    async (input: string): Promise<void> => {
      const prompt = input.trim()
      if (!prompt || loading) return

      append('user', prompt)
      setLoading(true)
      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: prompt,
            userInfo: user?.email ?? null,
          }),
        })
        if (!res.ok) {
          append('assistant', t('errorOccurred'))
          return
        }
        const data = await res.json()
        const reply = data.reply || data.text
        if (reply) {
          append('assistant', reply)
          savePrompt(prompt, reply).catch((err) => {
            console.error('savePrompt failed:', err)
          })
        }
        if (typeof data.remaining === 'number') {
          setRemaining(data.remaining)
          if (data.remaining === 0) setLimitExhausted(true)
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('ai-chat'))
        }
      } catch {
        append('assistant', t('errorOccurred'))
      } finally {
        setLoading(false)
      }
    },
    [append, loading, t, user?.email],
  )

  return { messages, loading, remaining, limitExhausted, send }
}
