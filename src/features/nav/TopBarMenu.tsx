'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import type { User } from 'firebase/auth'
import { useAuth } from '@/lib/AuthProvider'
import { useTheme } from '@/lib/ThemeProvider'
import i18n from '@/lib/i18n'
import { SUPPORTED_LANGS } from '@/lib/i18n-config'

const THEME_OPTIONS = [
  { key: 'light', icon: '☀️' },
  { key: 'dark', icon: '🌙' },
  { key: 'system', icon: '💻' },
] as const

interface TopBarMenuProps {
  onOpenPrompt: () => void
}

export default function TopBarMenu({ onOpenPrompt }: TopBarMenuProps): JSX.Element {
  const { user, login, logout } = useAuth()
  const { theme, setTheme } = useTheme()
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

  const changeLanguage = useCallback((l: string): void => {
    if (!i18n) return
    i18n.changeLanguage(l)
    document.documentElement.lang = l
    localStorage.setItem('lang', l)
  }, [])

  const handlePromptClick = (): void => {
    closeMenu()
    onOpenPrompt()
  }

  return (
    <div className="fixed top-3 right-3 sm:right-4 z-50">
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-label="menu"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          onClick={() => setMenuOpen((v) => !v)}
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

        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden backdrop-blur shadow-lg flex flex-col text-sm"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <NavLinks onNavigate={closeMenu} onPromptClick={handlePromptClick} />

            <Divider />

            <SettingsSection
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

            <AccountSection
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

function Divider(): JSX.Element {
  return <div className="h-px mx-3" style={{ background: 'var(--border)' }} />
}

interface NavLinksProps {
  onNavigate: () => void
  onPromptClick: () => void
}

function NavLinks({ onNavigate, onPromptClick }: NavLinksProps): JSX.Element {
  const { t } = useTranslation()
  const links: Array<{ href: string; label: string }> = [
    { href: '/about', label: t('about') },
    { href: '/journey', label: t('journey') },
    { href: '/portfolio', label: t('portfolio') },
    { href: '/blog', label: t('blog') },
    { href: '/faq', label: t('faq') },
  ]
  const itemClass = 'w-full text-left px-4 py-2.5 transition-colors hover:opacity-70 block'
  return (
    <div className="py-1">
      {links.map((link) => (
        <Link key={link.href} href={link.href} onClick={onNavigate} className={itemClass}>
          {link.label}
        </Link>
      ))}
      <button onClick={onPromptClick} className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70">
        {t('prompt')}
      </button>
    </div>
  )
}

type ThemeKey = (typeof THEME_OPTIONS)[number]['key']

interface SettingsSectionProps {
  open: boolean
  onToggle: () => void
  theme: string
  onSelectTheme: (key: ThemeKey) => void
  onSelectLanguage: (code: string) => void
}

function SettingsSection({
  open,
  onToggle,
  theme,
  onSelectTheme,
  onSelectLanguage,
}: SettingsSectionProps): JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="py-1">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-widest transition-colors hover:opacity-70"
        style={{ color: 'var(--muted)' }}
      >
        <span>{t('settings', { defaultValue: '설정' })}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div>
          <p className="px-4 pt-1 pb-1 text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            {t('theme', { defaultValue: 'Theme' })}
          </p>
          <div className="px-4 pb-1.5 flex gap-1">
            {THEME_OPTIONS.map((opt) => {
              const active = theme === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => onSelectTheme(opt.key)}
                  className="flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-colors"
                  style={
                    active
                      ? {
                          background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                          color: 'var(--primary)',
                        }
                      : { color: 'var(--muted)' }
                  }
                  aria-label={t(`theme${opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}`, { defaultValue: opt.key })}
                >
                  <span className="text-base">{opt.icon}</span>
                </button>
              )
            })}
          </div>

          <p className="px-4 pt-1.5 pb-1 text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            {t('language')}
          </p>
          <div className="px-4 pb-1.5 flex gap-1">
            {SUPPORTED_LANGS.map((l) => {
              const active = i18n.language === l.code
              return (
                <button
                  key={l.code}
                  onClick={() => onSelectLanguage(l.code)}
                  className="flex-1 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={
                    active
                      ? {
                          background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                          color: 'var(--primary)',
                        }
                      : { color: 'var(--muted)' }
                  }
                >
                  {l.code.toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface AccountSectionProps {
  user: User | null
  onLogin: () => void
  onLogout: () => void
}

function AccountSection({ user, onLogin, onLogout }: AccountSectionProps): JSX.Element {
  const { t } = useTranslation()
  if (!user) {
    return (
      <div className="py-1">
        <button onClick={onLogin} className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70">
          {t('signIn')}
        </button>
      </div>
    )
  }
  return (
    <div className="py-1">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt={user.displayName || 'profile'}
              width={24}
              height={24}
              className="rounded-full shrink-0"
              style={{ border: '1px solid var(--border)' }}
              referrerPolicy="no-referrer"
            />
          )}
          <span className="text-sm font-medium truncate">{user.displayName || user.email}</span>
        </div>
        <button
          onClick={onLogout}
          className="text-xs shrink-0 ml-2 transition-colors hover:opacity-70"
          style={{ color: 'var(--muted)' }}
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
