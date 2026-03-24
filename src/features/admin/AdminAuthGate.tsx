'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthProvider';
import { useAdminAuth } from './useAdminAuth';

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, error, ready, authenticate } = useAdminAuth();
  const { user, login, loading: authLoading } = useAuth();
  const [pw, setPw] = useState('');
  const { t } = useTranslation();

  if (!ready || authLoading) return null;
  if (isAuthenticated && user) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await login();
      return;
    }
    await authenticate(pw);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
        style={{
          background: 'var(--card-bg)',
          boxShadow: 'var(--card-shadow)',
          border: '1px solid var(--border)',
        }}
      >
        {/* 헤더 */}
        <div className="text-center">
          <div
            className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-lg"
            style={{
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
              color: 'var(--primary)',
            }}
          >
            🔒
          </div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            {t('adminAuthTitle')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {t('adminAuthDesc')}
          </p>
        </div>

        {/* Step 1: Google 로그인 */}
        {!user && (
          <button
            type="button"
            onClick={() => login()}
            className="w-full py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-contrast)',
            }}
          >
            Google {t('signIn')}
          </button>
        )}

        {/* Step 2: 비밀번호 입력 */}
        {user && !isAuthenticated && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{
                background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                color: 'var(--foreground)',
              }}
            >
              <span>✓</span>
              <span className="truncate">{user.email}</span>
            </div>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              className="w-full rounded-lg px-3 py-2.5"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--foreground)',
                fontSize: '16px',
              }}
              autoFocus
            />
            {error && (
              <p className="text-sm text-center" style={{ color: '#ef4444' }}>
                {t(error)}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !pw.trim()}
              className="w-full py-3 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-contrast)',
              }}
            >
              {loading ? t('loading') : t('confirm')}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
