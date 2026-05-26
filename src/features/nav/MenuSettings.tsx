'use client'

import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { SUPPORTED_LANGS } from '@/lib/i18n-config'

export const THEME_OPTIONS = [
  { key: 'light', icon: '☀️' },
  { key: 'dark', icon: '🌙' },
  { key: 'system', icon: '💻' },
] as const

export type ThemeKey = (typeof THEME_OPTIONS)[number]['key']

interface MenuSettingsProps {
  open: boolean
  onToggle: () => void
  theme: string
  onSelectTheme: (key: ThemeKey) => void
  onSelectLanguage: (code: string) => void
}

export default function MenuSettings({
  open,
  onToggle,
  theme,
  onSelectTheme,
  onSelectLanguage,
}: MenuSettingsProps): JSX.Element {
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
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div>
          <ThemePicker theme={theme} onSelect={onSelectTheme} />
          <LanguagePicker onSelect={onSelectLanguage} />
        </div>
      )}
    </div>
  )
}

function ThemePicker({
  theme,
  onSelect,
}: {
  theme: string
  onSelect: (key: ThemeKey) => void
}): JSX.Element {
  const { t } = useTranslation()
  return (
    <>
      <p
        className="px-4 pt-1 pb-1 text-[0.65rem] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--muted)' }}
      >
        {t('theme', { defaultValue: 'Theme' })}
      </p>
      <div className="px-4 pb-1.5 flex gap-1">
        {THEME_OPTIONS.map((opt) => {
          const active = theme === opt.key
          return (
            <button
              key={opt.key}
              onClick={() => onSelect(opt.key)}
              className="flex-1 flex items-center justify-center py-1.5 rounded-md text-sm transition-colors"
              style={
                active
                  ? {
                      background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                      color: 'var(--primary)',
                    }
                  : { color: 'var(--muted)' }
              }
              aria-label={t(
                `theme${opt.key.charAt(0).toUpperCase() + opt.key.slice(1)}`,
                { defaultValue: opt.key },
              )}
            >
              <span className="text-base">{opt.icon}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function LanguagePicker({ onSelect }: { onSelect: (code: string) => void }): JSX.Element {
  const { t } = useTranslation()
  return (
    <>
      <p
        className="px-4 pt-1.5 pb-1 text-[0.65rem] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--muted)' }}
      >
        {t('language')}
      </p>
      <div className="px-4 pb-1.5 flex gap-1">
        {SUPPORTED_LANGS.map((l) => {
          const active = i18n.language === l.code
          return (
            <button
              key={l.code}
              onClick={() => onSelect(l.code)}
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
    </>
  )
}
