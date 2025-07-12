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
            className="w-10 h-10 flex items-center justify-center rounded-full backdrop-blur bg-white/70 dark:bg-gray-800/70 shadow border border-gray-300 dark:border-gray-700 hover:bg-gray-100/70 dark:hover:bg-gray-700/60"
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
            <div className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden bg-[#2563eb] text-white shadow-lg backdrop-blur flex flex-col text-sm divide-y divide-white/30 py-2">
              <button
                onClick={togglePrompt}
                className="block w-full text-left px-4 py-3 hover:bg-blue-600"
              >
                {t('prompt')}
              </button>
              {!user && (
                <button
                  onClick={() => {
                    login()
                    setMenuOpen(false)
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-blue-600"
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
                    className="block w-full text-left px-4 py-3 hover:bg-blue-600"
                  >
                    {t('logout')}
                  </button>
                </>
              )}
              <div className="pt-2 mt-2 border-t border-white/30">
                <button
                  onClick={() => setLangOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-600 font-semibold"
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
                        className="block w-full text-left px-2 py-1 rounded hover:bg-white/10 text-base font-medium"
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
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-6 py-2 rounded-[24px] bg-[#357AE8] text-white text-sm leading-[1.4] shadow transition-transform hover:shadow-lg hover:scale-105 flex items-center"
        >
          <span className="mr-1.5" aria-hidden>🚀</span>
          {t('chatInvite')}
        </button>
      )}
      <PromptBox open={promptOpen} onClose={() => setPromptOpen(false)} />
    </>
  )
}
