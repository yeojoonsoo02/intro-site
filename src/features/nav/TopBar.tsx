'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/lib/AuthProvider'
import { useTheme } from '@/lib/ThemeProvider'
import i18n from '@/lib/i18n'
import { SUPPORTED_LANGS } from '@/lib/i18n-config'

const PromptBox = dynamic(() => import('@/features/prompt/PromptBox'), {
  ssr: false,
})

const LANGS = SUPPORTED_LANGS

export default function TopBar() {
  const { user, login, logout } = useAuth()
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [inviteVisible, setInviteVisible] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setInviteVisible(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
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
            aria-expanded={menuOpen}
            aria-haspopup="true"
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
              className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden backdrop-blur shadow-lg flex flex-col text-sm"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              {/* ── 탐색 ── */}
              <div className="py-1">
                <a
                  href="/portfolio"
                  onClick={closeMenu}
                  className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70 block"
                >
                  {t('portfolio')}
                </a>
                <button
                  onClick={togglePrompt}
                  className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70"
                >
                  {t('prompt')}
                </button>
              </div>

              <div className="h-px mx-3" style={{ background: "var(--border)" }} />

              {/* ── 설정 (접기/펼치기) ── */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-widest transition-colors hover:opacity-70"
                  style={{ color: "var(--muted)" }}
                >
                  <span>{t('settings', { defaultValue: '설정' })}</span>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {settingsOpen && (
                  <div>
                    <p className="px-4 pt-1 pb-1 text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                      {t('theme', { defaultValue: 'Theme' })}
                    </p>
                    <div className="px-4 pb-1.5 flex gap-1">
                      {themeOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => { setTheme(opt.key); closeMenu(); setSettingsOpen(false) }}
                          className="flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-colors"
                          style={theme === opt.key ? {
                            background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                            color: "var(--primary)",
                          } : { color: "var(--muted)" }}
                          aria-label={t(`theme${opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}`, { defaultValue: opt.key })}
                        >
                          <span className="text-base">{opt.icon}</span>
                        </button>
                      ))}
                    </div>

                    <p className="px-4 pt-1.5 pb-1 text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                      {t('language')}
                    </p>
                    <div className="px-4 pb-1.5 flex gap-1">
                      {LANGS.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { changeLanguage(l.code); closeMenu(); setSettingsOpen(false) }}
                          className="flex-1 py-1.5 rounded-md text-xs font-medium transition-colors"
                          style={i18n.language === l.code ? {
                            background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                            color: "var(--primary)",
                          } : { color: "var(--muted)" }}
                        >
                          {l.code.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px mx-3" style={{ background: "var(--border)" }} />

              {/* ── 계정 ── */}
              <div className="py-1">
                {!user && (
                  <button
                    onClick={() => { login(); closeMenu() }}
                    className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70"
                  >
                    {t('signIn')}
                  </button>
                )}
                {user && (
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {user.photoURL && (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || 'profile'}
                          width={24}
                          height={24}
                          className="rounded-full shrink-0"
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
                      className="text-xs shrink-0 ml-2 transition-colors hover:opacity-70"
                      style={{ color: "var(--muted)" }}
                    >
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
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
