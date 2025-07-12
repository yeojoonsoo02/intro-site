'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

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
      className="fixed top-4 right-4 w-80 max-w-[calc(100%-2rem)] bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-600 rounded-xl p-3 shadow z-50"
    >
      <p className="mb-2 text-sm leading-relaxed">{t('feedbackMessage')}</p>
      <div className="text-right">
        <button
          type="button"
          onClick={() => {
            onShowComments()
            hide()
          }}
          className="px-3 py-1 text-sm rounded-md bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-500 text-white hover:opacity-90"
        >
          {t('goToComments')}
        </button>
      </div>
    </div>
  )
}
