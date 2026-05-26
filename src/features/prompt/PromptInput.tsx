'use client'

import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PromptInputProps {
  maxChars: number
  disabled: boolean
  limitExhausted: boolean
  onSend: (text: string) => void
}

const PromptInput = forwardRef<HTMLInputElement, PromptInputProps>(function PromptInput(
  { maxChars, disabled, limitExhausted, onSend },
  ref,
) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0 && !disabled && !limitExhausted

  const handleSend = (): void => {
    if (!canSend) return
    onSend(text)
    setText('')
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <input
          ref={ref}
          type="text"
          value={text}
          disabled={disabled || limitExhausted}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
          placeholder={limitExhausted ? t('noQuestionsLeft') : t('typeYourPrompt')}
          className="w-full rounded-lg px-3 py-2.5 pr-12 transition-colors disabled:opacity-50"
          style={{
            background: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
            fontSize: '16px',
          }}
        />
        {text.length > 0 && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] tabular-nums"
            style={{ color: text.length >= maxChars ? '#ef4444' : 'var(--muted)' }}
          >
            {text.length}/{maxChars}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="text-sm px-4 py-2.5 rounded-lg font-medium transition-opacity disabled:opacity-30"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-contrast)',
        }}
      >
        {t('send')}
      </button>
    </div>
  )
})

export default PromptInput
