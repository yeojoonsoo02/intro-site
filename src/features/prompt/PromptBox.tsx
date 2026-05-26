'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/AuthProvider'
import { useChat } from './useChat'
import MessageList from './MessageList'
import PromptInput from './PromptInput'

const MAX_CHARS_GUEST = 200
const MAX_CHARS_USER = 500

interface PromptBoxProps {
  open: boolean
  onClose: () => void
}

export default function PromptBox({ open, onClose }: PromptBoxProps): JSX.Element {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const { messages, loading, remaining, limitExhausted, send } = useChat()
  const [collapsed, setCollapsed] = useState(false)
  const [dots, setDots] = useState(1)
  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const maxChars = user ? MAX_CHARS_USER : MAX_CHARS_GUEST

  useEffect(() => {
    if (collapsed || !listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, collapsed, open])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 300)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!loading) {
      setDots(1)
      return
    }
    const id = window.setInterval(() => {
      setDots((d) => (d % 3) + 1)
    }, 500)
    return () => window.clearInterval(id)
  }, [loading])

  return (
    <div
      className={`fixed bottom-0 left-0 w-full backdrop-blur-md border-t p-3 transition-transform duration-300 z-40 ${
        open ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
      style={{
        background: 'color-mix(in srgb, var(--card-bg) 85%, transparent)',
        borderColor: 'var(--border)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-xl mx-auto flex flex-col gap-3">
        <Header
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
          onClose={onClose}
        />

        {!collapsed && (
          <MessageList
            ref={listRef}
            messages={messages}
            loading={loading}
            dots={dots}
            onSuggestionClick={send}
          />
        )}

        {limitExhausted && (
          <p className="text-xs text-center py-1" style={{ color: 'var(--muted)' }}>
            {t('noQuestionsLeft')}
          </p>
        )}

        <PromptInput
          ref={inputRef}
          maxChars={maxChars}
          disabled={loading}
          limitExhausted={limitExhausted}
          onSend={send}
        />

        <Footer
          showLogin={!user}
          onLogin={() => login()}
          remaining={remaining}
          limitExhausted={limitExhausted}
        />
      </div>
    </div>
  )
}

interface HeaderProps {
  collapsed: boolean
  onToggleCollapsed: () => void
  onClose: () => void
}

function Header({ collapsed, onToggleCollapsed, onClose }: HeaderProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="flex justify-between items-center">
      <button
        type="button"
        aria-label={collapsed ? t('showConversation') : t('hideConversation')}
        onClick={onToggleCollapsed}
        className="text-xs px-3 py-2 rounded-md transition-colors"
        style={{
          border: '1px solid var(--border)',
          color: 'var(--muted)',
        }}
      >
        {collapsed ? t('showConversation') : t('hideConversation')}
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('close')}
        className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:opacity-70"
        style={{ color: 'var(--muted)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

interface FooterProps {
  showLogin: boolean
  onLogin: () => void
  remaining: number | null
  limitExhausted: boolean
}

function Footer({ showLogin, onLogin, remaining, limitExhausted }: FooterProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="flex justify-between items-center gap-2">
      <p className="text-[0.65rem]" style={{ color: 'var(--muted)', opacity: 0.7 }}>
        {t('aiDisclaimer')}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        {showLogin && (
          <button
            type="button"
            onClick={onLogin}
            className="text-[0.65rem] px-2 py-0.5 rounded transition-colors hover:opacity-80"
            style={{
              color: 'var(--primary)',
              border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
            }}
          >
            {t('loginForMore')}
          </button>
        )}
        {remaining !== null && !limitExhausted && (
          <p className="text-[0.65rem] tabular-nums" style={{ color: 'var(--muted)' }}>
            {t('remaining', { count: remaining })}
          </p>
        )}
      </div>
    </div>
  )
}
