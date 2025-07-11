'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { useAuth } from '@/lib/AuthProvider'
import i18n from '@/lib/i18n'
import PromptBox from '@/features/prompt/PromptBox'

const LANGS = [
  { code: 'ko', label: '🇰🇷' },
  { code: 'en', label: '🇺🇸' },
]

export default function TopBar() {
  const { user, login, logout } = useAuth()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [inviteVisible, setInviteVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setInviteVisible(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  const changeLanguage = (l: string) => {
    if (!i18n) return
    i18n.changeLanguage(l)
    document.documentElement.lang = l
    localStorage.setItem('lang', l)
  }

  const togglePrompt = () => {
    setPromptOpen((v) => !v)
    setMenuOpen(false)
  }

  return (
    <>
      <div className="fixed top-2 right-4 z-50">
        <div className="relative">
          <button
            type="button"
            aria-label="menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-full backdrop-blur bg-white/60 dark:bg-gray-800/60 shadow border border-gray-300 dark:border-gray-700 hover:bg-gray-200/70 dark:hover:bg-gray-700/60"
          >
            <span className="text-xl">···</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-300 dark:border-gray-700 rounded-lg shadow text-sm">
              <button
                onClick={togglePrompt}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('prompt')}
              </button>
              {!user && (
                <button
                  onClick={() => {
                    login()
                    setMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('signIn')}
                </button>
              )}
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('viewProfile')}
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('logout')}
                  </button>
                </>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2">
                <span className="mr-auto">{t('language')}</span>
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      changeLanguage(l.code)
                      setMenuOpen(false)
                    }}
                    className="px-1 hover:underline"
                  >
                    {l.label}
                  </button>
                ))}
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
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-md bg-blue-500/80 text-white shadow"
        >
          {t('chatInvite')}
        </button>
      )}
      <PromptBox open={promptOpen} onClose={() => setPromptOpen(false)} />
    </>
  )
}
