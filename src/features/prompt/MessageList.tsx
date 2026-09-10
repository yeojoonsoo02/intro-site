'use client'

import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatMessage } from './useChat'

interface MessageListProps {
  messages: ChatMessage[]
  loading: boolean
  dots: number
  onSuggestionClick: (text: string) => void
}

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(function MessageList(
  { messages, loading, dots, onSuggestionClick },
  ref,
) {
  const { t } = useTranslation()

  return (
    <div
      ref={ref}
      className="max-h-[min(15rem,32dvh)] sm:max-h-72 overflow-y-auto space-y-2 scroll-smooth overscroll-contain"
      role="log"
      aria-live="polite"
    >
      {messages.length === 0 && !loading && (
        <SuggestionsPanel onPick={onSuggestionClick} />
      )}
      {messages.map((m) => (
        <MessageBubble key={m.id} role={m.role} text={m.text} />
      ))}
      {loading && (
        <div
          className="text-[0.9375rem] max-w-[85%] sm:max-w-[75%] mr-auto px-3.5 py-2 rounded-xl rounded-bl-sm"
          style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}
        >
          {t('typing')}
          {'.'.repeat(dots)}
        </div>
      )}
    </div>
  )
})

export default MessageList

function MessageBubble({ role, text }: { role: ChatMessage['role']; text: string }): JSX.Element {
  const isUser = role === 'user'
  const baseCls =
    'text-[0.9375rem] leading-relaxed break-keep whitespace-pre-wrap overflow-wrap-anywhere max-w-[85%] sm:max-w-[75%] px-3.5 py-2 rounded-xl'
  const sideCls = isUser ? 'ml-auto rounded-br-sm' : 'mr-auto rounded-bl-sm'
  const style = isUser
    ? { background: 'var(--accent)', color: 'var(--accent-contrast)' }
    : { background: 'var(--surface-2)', color: 'var(--ink)' }
  return (
    <div className={`${baseCls} ${sideCls}`} style={style}>
      {text}
    </div>
  )
}

function SuggestionsPanel({ onPick }: { onPick: (text: string) => void }): JSX.Element {
  const { t } = useTranslation()
  const suggestions = [
    t('suggestQ1', { defaultValue: '지금 어디야?' }),
    t('suggestQ2', { defaultValue: '취미가 뭐야?' }),
    t('suggestQ3', { defaultValue: '좋아하는 음식은?' }),
    t('suggestQ4', { defaultValue: '요즘 뭐 하고 지내?' }),
  ]
  return (
    <div className="py-3 space-y-2">
      <p className="text-center text-[0.875rem] mb-3" style={{ color: 'var(--muted)' }}>
        {t('typeYourPrompt')}
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="text-[0.875rem] px-3.5 py-1.5 rounded-full transition-colors hover:opacity-70"
            style={{
              border: '1px solid var(--rule)',
              color: 'var(--ink-2)',
              background: 'var(--surface)',
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
