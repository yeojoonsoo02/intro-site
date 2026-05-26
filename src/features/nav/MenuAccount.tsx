'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import type { User } from 'firebase/auth'

interface MenuAccountProps {
  user: User | null
  onLogin: () => void
  onLogout: () => void
}

export default function MenuAccount({
  user,
  onLogin,
  onLogout,
}: MenuAccountProps): JSX.Element {
  const { t } = useTranslation()
  if (!user) {
    return (
      <div className="py-1">
        <button
          onClick={onLogin}
          className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70"
        >
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
          <span className="text-sm font-medium truncate">
            {user.displayName || user.email}
          </span>
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
