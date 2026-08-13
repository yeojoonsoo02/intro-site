'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthProvider'
import { useTheme } from '@/lib/ThemeProvider'
import i18n from '@/lib/i18n'
import MenuNavLinks from './MenuNavLinks'
import MenuSettings from './MenuSettings'
import MenuAccount from './MenuAccount'
import { persistLocale, localizePath } from '@/lib/locale'

interface TopBarMenuProps {
  onOpenPrompt: () => void
}

export default function TopBarMenu({ onOpenPrompt }: TopBarMenuProps): JSX.Element {
  const { user, login, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  const closeMenu = useCallback((): void => setMenuOpen(false), [])

  const changeLanguage = useCallback(
    (l: string): void => {
      if (!i18n) return
      i18n.changeLanguage(l)
      // 쿠키까지 함께 갱신하지 않으면 미들웨어가 이전 언어로 되돌린다 —
      // 메뉴에서 고른 언어가 링크 한 번에 무효가 되던 문제.
      persistLocale(l)
      // 홈으로 튕기지 않고 보던 페이지의 같은 언어판으로 이동.
      router.push(localizePath(pathname, l))
    },
    [pathname, router],
  )

  return (
    <div
      className="fixed z-50"
      style={{
        // viewport-fit=cover라 노치 영역까지 뷰포트가 확장돼 있다. 사이트의 유일한
        // 전역 내비게이션이 센서 하우징에 가리지 않도록 안전영역을 존중한다.
        top: 'max(0.75rem, env(safe-area-inset-top))',
        right: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
      <div className="relative" ref={menuRef}>
        <MenuTrigger open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} />

        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden backdrop-blur shadow-lg flex flex-col text-sm"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <MenuNavLinks
              onNavigate={closeMenu}
              onPromptClick={() => {
                closeMenu()
                onOpenPrompt()
              }}
            />

            <Divider />

            <MenuSettings
              open={settingsOpen}
              onToggle={() => setSettingsOpen((v) => !v)}
              theme={theme}
              onSelectTheme={(key) => {
                setTheme(key)
                closeMenu()
                setSettingsOpen(false)
              }}
              onSelectLanguage={(code) => {
                changeLanguage(code)
                closeMenu()
                setSettingsOpen(false)
              }}
            />

            <Divider />

            <MenuAccount
              user={user}
              onLogin={() => {
                login()
                closeMenu()
              }}
              onLogout={() => {
                logout()
                closeMenu()
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function MenuTrigger({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      aria-label="menu"
      aria-expanded={open}
      aria-haspopup="true"
      onClick={onToggle}
      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full backdrop-blur shadow-sm transition-colors"
      style={{
        background: 'color-mix(in srgb, var(--card-bg) 80%, transparent)',
        border: '1px solid var(--border)',
        color: 'var(--foreground)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
      </svg>
    </button>
  )
}

function Divider(): JSX.Element {
  return <div className="h-px mx-3" style={{ background: 'var(--border)' }} />
}
