'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/AuthProvider'
import { useTheme } from '@/lib/ThemeProvider'
import MenuNavLinks from './MenuNavLinks'
import MenuSettings from './MenuSettings'
import MenuAccount from './MenuAccount'
import { setLocale, localizePath } from '@/lib/locale'
import { isLang } from '@/lib/site'

interface TopBarMenuProps {
  onOpenPrompt: () => void
}

export default function TopBarMenu({ onOpenPrompt }: TopBarMenuProps): JSX.Element {
  const { user, login, logout } = useAuth()
  const { i18n } = useTranslation()
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
      if (!isLang(l)) return
      // i18next·쿠키·localStorage·html lang을 한 번에. 쿠키를 빼먹으면 미들웨어가
      // 이전 언어로 되돌린다 — 메뉴에서 고른 언어가 링크 한 번에 무효가 되던 문제.
      setLocale(i18n, l)
      // 홈으로 튕기지 않고 보던 페이지의 같은 언어판으로 이동.
      router.push(localizePath(pathname, l))
    },
    [i18n, pathname, router],
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
            className="absolute right-0 mt-2 w-60 overflow-hidden backdrop-blur flex flex-col text-[0.9375rem]"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--rule)',
              color: 'var(--ink)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow)',
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
      className="w-11 h-11 flex items-center justify-center rounded-full backdrop-blur transition-colors"
      style={{
        background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
        border: '1px solid var(--rule)',
        color: 'var(--ink)',
        boxShadow: 'var(--shadow-1)',
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
