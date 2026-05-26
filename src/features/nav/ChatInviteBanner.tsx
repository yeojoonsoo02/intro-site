'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ChatInviteBannerProps {
  hidden: boolean
  onOpen: () => void
}

const INVITE_DELAY_MS = 10000

export default function ChatInviteBanner({
  hidden,
  onOpen,
}: ChatInviteBannerProps): JSX.Element | null {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), INVITE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!visible || hidden) return null

  const handleOpen = (): void => {
    setVisible(false)
    onOpen()
  }

  const handleClose = (): void => setVisible(false)

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1">
      <button
        type="button"
        onClick={handleOpen}
        className="px-5 py-2 rounded-full text-sm font-medium shadow-md transition-transform hover:scale-105 flex items-center break-keep"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-contrast)',
        }}
      >
        {t('chatInvite')}
      </button>
      <button
        type="button"
        onClick={handleClose}
        aria-label={t('close')}
        className="w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-opacity hover:opacity-70"
        style={{
          background: 'var(--card-bg)',
          color: 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
