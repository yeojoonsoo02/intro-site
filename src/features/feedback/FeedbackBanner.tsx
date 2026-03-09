'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function FeedbackBanner({
  onShowComments,
  trigger,
}: {
  onShowComments: () => void
  trigger: number
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [startY, setStartY] = useState<number | null>(null)

  useEffect(() => {
    if (trigger === 0) return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('hideFeedbackBanner') === '1') return
    const timer = setTimeout(() => setVisible(true), 10000)
    return () => clearTimeout(timer)
  }, [trigger])

  const hide = () => {
    setVisible(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hideFeedbackBanner', '1')
    }
  }

  if (!visible) return null

  return (
    <div
      onTouchStart={(e) => setStartY(e.touches[0].clientY)}
      onTouchMove={(e) => {
        if (startY !== null && e.touches[0].clientY - startY > 50) hide()
      }}
      className="fixed top-4 right-4 w-80 max-w-[calc(100%-2rem)] backdrop-blur-md border rounded-xl p-3 shadow z-50"
      style={{ background: "color-mix(in srgb, var(--card-bg) 85%, transparent)", borderColor: "var(--border)" }}
    >
      <p className="mb-2 text-sm leading-relaxed break-keep whitespace-pre-wrap overflow-wrap-anywhere">{t('feedbackMessage')}</p>
      <div className="text-right">
        <button
          type="button"
          onClick={() => {
            onShowComments()
            hide()
          }}
          className="px-3 py-1 text-sm rounded-md hover:opacity-90"
          style={{ background: "var(--primary)", color: "var(--primary-contrast)" }}
        >
          {t('goToComments')}
        </button>
      </div>
    </div>
  )
}
