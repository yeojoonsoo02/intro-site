'use client';

import { useState } from 'react';
import Link from 'next/link';
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;
    await authenticate(pw);
  };

  return (
    <div className="admin-modal-backdrop">
      {/* Step 1: Google 로그인 */}
      {!user && (
        <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
          <div className="text-lg font-semibold mb-1">{t('adminAuthTitle')}</div>
          <div className="text-sm text-muted mb-2">Google 계정으로 로그인해주세요.</div>
          <div className="modal-actions mt-2">
            <button
              type="button"
              className="modal-btn"
              onClick={() => login()}
            >
              Google {t('signIn')}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 비밀번호 입력 */}
      {user && !isAuthenticated && (
        <form
          className="admin-modal"
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <div className="text-lg font-semibold mb-1">{t('adminAuthTitle')}</div>
          <div className="text-sm text-muted mb-1">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs"
              style={{
                background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                color: 'var(--primary)',
              }}
            >
              ✓ {user.email}
            </span>
          </div>
          <div className="text-sm text-muted mb-2">{t('adminAuthDesc')}</div>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); }}
            placeholder={t('passwordPlaceholder')}
            autoFocus
            maxLength={32}
            disabled={loading}
          />
          {error && <div className="text-red-500 text-xs mt-1">{t(error)}</div>}
          <div className="modal-actions mt-2">
            <Link
              href="/"
              className="modal-btn cancel"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {t('cancel')}
            </Link>
            <button type="submit" className="modal-btn" disabled={loading || !pw.trim()}>
              {loading ? '...' : t('confirm')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
