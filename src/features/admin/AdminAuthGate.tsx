'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from './useAdminAuth';

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, error, ready, authenticate } = useAdminAuth();
  const [pw, setPw] = useState('');
  const { t } = useTranslation();

  if (!ready) return null;
  if (isAuthenticated) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authenticate(pw);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-5"
        style={{
          background: 'var(--card-bg)',
          boxShadow: 'var(--card-shadow)',
          border: '1px solid var(--border)',
        }}
      >
        <h1 className="text-xl font-bold text-center" style={{ color: 'var(--foreground)' }}>
          {t('adminAuthTitle')}
        </h1>
        <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
          {t('adminAuthDesc')}
        </p>
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
    </main>
  );
}
