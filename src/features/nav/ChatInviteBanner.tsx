'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { isLang } from '@/lib/site'

interface ChatInviteBannerProps {
  hidden: boolean
  onOpen: () => void
}

const INVITE_DELAY_MS = 10000
const FOOTER_ZONE_PX = 160

// 본문에 상시 CTA가 이미 있는 페이지 — 랜딩(HomeClient)과 소개(AboutChatCta).
// 여기서 배너까지 띄우면 같은 문구의 버튼이 위아래로 겹쳐 본문을 가린다.
function hasInlineChatCta(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  const rest = isLang(segments[0])
    ? segments.slice(1)
    : segments
  return rest.length === 0 || rest[0] === 'about'
}

export default function ChatInviteBanner({
  hidden,
  onOpen,
}: ChatInviteBannerProps): JSX.Element | null {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [nearBottom, setNearBottom] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), INVITE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  // 페이지 끝에는 푸터·이전/다음 링크가 있다. 코너 배너가 그걸 덮지 않도록
  // 바닥 근처에 오면 잠시 물러났다가 다시 올라오면 돌아온다.
  useEffect(() => {
    if (!visible) return
    const update = (): void => {
      const remaining =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      setNearBottom(remaining < FOOTER_ZONE_PX)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [visible, pathname])

  if (!visible || hidden || hasInlineChatCta(pathname)) return null

  const handleOpen = (): void => {
    setVisible(false)
    onOpen()
  }

  const handleClose = (): void => setVisible(false)

  return (
    // 화면 중앙이 아니라 우측 하단 코너에 둔다 — 본문·푸터 링크와 겹치지 않는 자리.
    <div
      className={`fixed right-4 z-40 flex items-center gap-1 transition-[opacity,transform] duration-200 ease-out motion-safe:animate-[modalIn_0.4s_cubic-bezier(0.16,1,0.3,1)] ${
        nearBottom ? 'opacity-0 translate-y-2 pointer-events-none' : ''
      }`}
      style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      aria-hidden={nearBottom}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="px-5 py-2.5 rounded-full text-sm font-medium shadow-md transition-transform hover:scale-105 flex items-center gap-2 break-keep"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-contrast)',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M14 9.5a2 2 0 0 1-2 2H6l-3.5 2.5v-2.5a2 2 0 0 1-1-1.7V4.5a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        {t('chatInvite')}
      </button>
      <button
        type="button"
        onClick={handleClose}
        aria-label={t('close')}
        className="w-11 h-11 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
        style={{ color: 'var(--muted)' }}
      >
        <span
          className="w-8 h-8 flex items-center justify-center rounded-full shadow-md"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
        >
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
    </div>
  )
}
