'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { useAuth } from '@/lib/AuthProvider'
import i18n from '@/lib/i18n'
import PromptBox from '@/features/prompt/PromptBox'

const LANGS = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
]

export default function TopBar() {
  const { user, login, logout } = useAuth()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [inviteVisible, setInviteVisible] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

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
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setLangOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                >
                  <span>{t('language')}</span>
                  <span>{langOpen ? '▲' : '▼'}</span>
                </button>
                {langOpen && (
                  <div className="px-3 pb-2 space-y-1">
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
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-md bg-blue-500/80 text-white shadow"
        >
          {t('chatInvite')}
        </button>
      )}
      <PromptBox open={promptOpen} onClose={() => setPromptOpen(false)} />
    </>
  )
}
