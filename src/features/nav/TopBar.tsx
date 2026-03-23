'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/AuthProvider'
import { useTheme } from '@/lib/ThemeProvider'
import i18n from '@/lib/i18n'

const PromptBox = dynamic(() => import('@/features/prompt/PromptBox'), {
  ssr: false,
})

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
]

export default function TopBar() {
  const { user, login, logout } = useAuth()
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [inviteVisible, setInviteVisible] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setInviteVisible(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!menuOpen) {
      setLangOpen(false)
      setThemeOpen(false)
      return
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const changeLanguage = useCallback((l: string) => {
    if (!i18n) return
    i18n.changeLanguage(l)
    document.documentElement.lang = l
    localStorage.setItem('lang', l)
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const togglePrompt = useCallback(() => {
    setPromptOpen((v) => !v)
    closeMenu()
  }, [closeMenu])

  const themeOptions = [
    { key: 'light', icon: '☀️' },
    { key: 'dark', icon: '🌙' },
    { key: 'system', icon: '💻' },
  ] as const

  return (
    <>
      <div className="fixed top-3 right-3 sm:right-4 z-50">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full backdrop-blur shadow-sm transition-colors"
            style={{
              background: "color-mix(in srgb, var(--card-bg) 80%, transparent)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
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
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden backdrop-blur shadow-lg flex flex-col text-sm py-1"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              {/* AI 채팅 */}
              <button
                onClick={togglePrompt}
                className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70"
              >
                {t('prompt')}
              </button>

              <div className="h-px mx-3" style={{ background: "var(--border)" }} />

              {/* 테마 */}
              <button
                onClick={() => setThemeOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 font-medium transition-colors hover:opacity-70"
              >
                <span>{t('theme', { defaultValue: 'Theme' })}</span>
                <svg
                  className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${themeOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5 7l5 5 5-5H5z" clipRule="evenodd" />
                </svg>
              </button>
              {themeOpen && (
                <div className="px-4 pb-2 space-y-0.5">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setTheme(opt.key); closeMenu() }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors hover:opacity-70"
                      style={theme === opt.key ? {
                        background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                        color: "var(--primary)",
                      } : {}}
                    >
                      <span>{t(`theme${opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}`, { defaultValue: opt.key })}</span>
                      <span className="text-base">{opt.icon}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="h-px mx-3" style={{ background: "var(--border)" }} />

              {/* 로그인/프로필 */}
              {!user && (
                <button
                  onClick={() => { login(); closeMenu() }}
                  className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70"
                >
                  {t('signIn')}
                </button>
              )}
              {user && (
                <div className="px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    {user.photoURL && (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'profile'}
                        width={24}
                        height={24}
                        className="rounded-full"
                        style={{ border: "1px solid var(--border)" }}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="text-sm font-medium truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => { logout(); closeMenu() }}
                    className="text-xs transition-colors hover:opacity-70"
                    style={{ color: "var(--muted)" }}
                  >
                    {t('logout')}
                  </button>
                </div>
              )}

              <div className="h-px mx-3" style={{ background: "var(--border)" }} />

              {/* 언어 */}
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 font-medium transition-colors hover:opacity-70"
              >
                <span>{t('language')}</span>
                <svg
                  className={`w-3.5 h-3.5 ml-1 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5 7l5 5 5-5H5z" clipRule="evenodd" />
                </svg>
              </button>
              {langOpen && (
                <div className="px-4 pb-2 space-y-0.5">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { changeLanguage(l.code); closeMenu() }}
                      className="w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors hover:opacity-70"
                      style={i18n.language === l.code ? {
                        background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                        color: "var(--primary)",
                      } : {}}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 채팅 초대 배너 */}
      {inviteVisible && !promptOpen && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPromptOpen(true)
              setInviteVisible(false)
            }}
            className="px-5 py-2 rounded-full text-sm font-medium shadow-md transition-transform hover:scale-105 flex items-center break-keep"
            style={{
              background: "var(--primary)",
              color: "var(--primary-contrast)",
            }}
          >
            {t('chatInvite')}
          </button>
          <button
            type="button"
            onClick={() => setInviteVisible(false)}
            aria-label={t('close')}
            className="w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-opacity hover:opacity-70"
            style={{
              background: "var(--card-bg)",
              color: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      <PromptBox open={promptOpen} onClose={() => setPromptOpen(false)} />
    </>
  )
}
