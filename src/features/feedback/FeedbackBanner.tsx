'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

export default function FeedbackBanner({ onShowComments }: { onShowComments: () => void }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [startY, setStartY] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('hideFeedbackBanner') === '1') return
    const timer = setTimeout(() => setVisible(true), 10000)
    return () => clearTimeout(timer)
  }, [])

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
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow z-50"
    >
      <p className="mb-2 text-sm leading-relaxed">{t('feedbackMessage')}</p>
      <div className="text-right">
        <button
          type="button"
          onClick={() => {
            onShowComments()
            hide()
          }}
          className="px-3 py-1 text-sm rounded-md bg-blue-500/80 text-white hover:bg-blue-600"
        >
          {t('goToComments')}
        </button>
      </div>
    </div>
  )
}
