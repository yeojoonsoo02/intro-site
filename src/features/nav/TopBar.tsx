'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/lib/AuthProvider';
import i18n from '@/lib/i18n';

const LANGS = [
  { code: 'ko', label: '🇰🇷' },
  { code: 'en', label: '🇺🇸' },
];

export default function TopBar() {
  const { user, logout, login } = useAuth();
  const { t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const changeLanguage = (l: string) => {
    if (!i18n) return;
    i18n.changeLanguage(l);
    document.documentElement.lang = l;
    localStorage.setItem('lang', l);
    setLangOpen(false);
  };

  return (
    <div className="fixed top-2 right-4 z-50 flex gap-1 p-1 rounded-full backdrop-blur bg-white/50 dark:bg-gray-800/50 shadow border border-gray-300 dark:border-gray-700">
      {/* Language */}
      <div className="relative">
        <button
          type="button"
          aria-label={t('language')}
          onClick={() => setLangOpen(!langOpen)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/60"
        >
          🌐
        </button>
        {langOpen && (
          <div className="absolute right-0 mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-300 dark:border-gray-700 rounded-lg shadow text-sm overflow-hidden">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className="block w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout Icon */}
      {user && (
        <div className="relative">
          <button
            type="button"
            aria-label={t('logout')}
            onClick={() => setLogoutOpen(!logoutOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/60"
          >
            🔓
          </button>
          {logoutOpen && (
            <div className="absolute right-0 mt-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-300 dark:border-gray-700 rounded-lg shadow p-2 text-sm">
              <div className="mb-2">{t('confirm')}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => { logout(); setLogoutOpen(false); }}
                  className="flex-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('logout')}
                </button>
                <button
                  onClick={() => setLogoutOpen(false)}
                  className="flex-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile Icon */}
      {user ? (
        <div className="relative">
          <button
            type="button"
            aria-label={t('profilePhoto')}
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden hover:bg-gray-200/70 dark:hover:bg-gray-700/60"
          >
            {user.photoURL ? (
              <Image src={user.photoURL} alt={t('profilePhoto')} width={32} height={32} className="rounded-full" />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-300 dark:border-gray-700 rounded-lg shadow p-3 text-sm">
              <div className="mb-2 font-medium truncate">
                {user.displayName || user.email}
              </div>
              <Link href="/dashboard" className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                {t('viewProfile')}
              </Link>
              <button
                onClick={() => { logout(); setProfileOpen(false); }}
                className="block w-full text-left px-2 py-1 mt-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={login}
          aria-label={t('signIn')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/60"
        >
          🔑
        </button>
      )}
    </div>
  );
}
