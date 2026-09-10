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
          aria-label={t('typeYourPrompt')}
          className="w-full px-3.5 py-2.5 pr-14 transition-colors disabled:opacity-50"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--rule)',
            color: 'var(--ink)',
            fontSize: '16px',
            borderRadius: 'var(--r-md)',
          }}
        />
        {text.length > 0 && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 meta"
            style={{ color: text.length >= maxChars ? 'var(--danger)' : 'var(--muted)' }}
          >
            {text.length}/{maxChars}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="btn btn-primary disabled:opacity-30"
      >
        {t('send')}
      </button>
    </div>
  )
})

export default PromptInput
