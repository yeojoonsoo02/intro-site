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
    if (!menuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setLangOpen(false)
        setThemeOpen(false)
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

  const togglePrompt = useCallback(() => {
    setPromptOpen((v) => !v)
    setMenuOpen(false)
  }, [])

  return (
    <>
      <div className="fixed top-2 right-2 sm:right-4 z-50">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full backdrop-blur bg-white/70 dark:bg-gray-800/70 shadow border border-gray-300 dark:border-gray-700 hover:bg-gray-100/70 dark:hover:bg-gray-700/60"
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
            <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur flex flex-col text-sm divide-y divide-gray-200 dark:divide-gray-700 py-2">
              <button
                onClick={togglePrompt}
                className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('prompt')}
              </button>
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setThemeOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                >
                  <span>{t('theme', { defaultValue: 'Theme' })}</span>
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform ${themeOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5 7l5 5 5-5H5z" clipRule="evenodd" />
                  </svg>
                </button>
                {themeOpen && (
                  <div className="px-5 pb-2 space-y-1">
                    <button
                      onClick={() => { setTheme('light'); setMenuOpen(false); setThemeOpen(false) }}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        theme === 'light' ? 'bg-gray-200 dark:bg-gray-600' : ''
                      }`}
                    >
                      <span>{t('themeLight', { defaultValue: 'Light Mode' })}</span>
                      <span className="text-lg">☀️</span>
                    </button>
                    <button
                      onClick={() => { setTheme('dark'); setMenuOpen(false); setThemeOpen(false) }}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        theme === 'dark' ? 'bg-gray-200 dark:bg-gray-600' : ''
                      }`}
                    >
                      <span>{t('themeDark', { defaultValue: 'Dark Mode' })}</span>
                      <span className="text-lg">🌙</span>
                    </button>
                    <button
                      onClick={() => { setTheme('system'); setMenuOpen(false); setThemeOpen(false) }}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        theme === 'system' ? 'bg-gray-200 dark:bg-gray-600' : ''
                      }`}
                    >
                      <span>{t('themeSystem', { defaultValue: 'System Theme' })}</span>
                      <span className="text-lg">💻</span>
                    </button>
                  </div>
                )}
              </div>
              {!user && (
                <button
                  onClick={() => {
                    login()
                    setMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('signIn')}
                </button>
              )}
              {user && (
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    {user.photoURL && (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || 'profile'}
                        width={28}
                        height={28}
                        className="rounded-full border border-gray-300 dark:border-gray-600"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="text-sm font-medium truncate">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    className="block w-full text-left text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-xs"
                  >
                    {t('logout')}
                  </button>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setLangOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                >
                  <span>{t('language')}</span>
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5 7l5 5 5-5H5z" clipRule="evenodd" />
                  </svg>
                </button>
                {langOpen && (
                  <div className="px-5 pb-2 space-y-1">
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          changeLanguage(l.code)
                          setMenuOpen(false)
                          setLangOpen(false)
                        }}
                        className="block w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-base font-medium"
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {inviteVisible && !promptOpen && (
        <button
          type="button"
          onClick={() => {
            setPromptOpen(true)
            setInviteVisible(false)
          }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-6 py-2 rounded-[24px] bg-blue-500 dark:bg-blue-600 text-white text-sm leading-[1.4] shadow transition-transform hover:shadow-lg hover:scale-105 flex items-center break-keep whitespace-pre-wrap overflow-wrap-anywhere"
        >
          <span className="mr-1.5" aria-hidden>🚀</span>
          {t('chatInvite')}
        </button>
      )}
      <PromptBox open={promptOpen} onClose={() => setPromptOpen(false)} />
    </>
  )
}
