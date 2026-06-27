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

  // Esc 키로 배너 닫기 — 배너가 보일 때만 리스너 등록, cleanup으로 해제
  useEffect(() => {
    if (!visible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible])

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
      {/* 명시적 닫기(X) 버튼 — 44px 터치 타깃, 아이콘 시각 크기는 유지 */}
      <button
        type="button"
        onClick={hide}
        aria-label={t('closeFeedback')}
        className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-lg leading-none hover:opacity-70 transition"
        style={{ color: "var(--foreground)" }}
      >
        ✕
      </button>
      <p className="mb-2 pr-9 text-sm leading-relaxed break-keep whitespace-pre-wrap overflow-wrap-anywhere">{t('feedbackMessage')}</p>
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
