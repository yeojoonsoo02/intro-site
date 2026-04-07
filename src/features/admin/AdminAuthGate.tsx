'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthProvider';
import { useAdminAuth } from './useAdminAuth';

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, ready } = useAdminAuth();
  const { user, login, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  if (!ready || authLoading) return null;
  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold mb-1">{t('adminAuthTitle')}</div>
        {!user ? (
          <>
            <div className="text-sm text-muted mb-2">Google 계정으로 로그인해주세요.</div>
            <div className="modal-actions mt-2">
              <Link
                href="/"
                className="modal-btn cancel"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {t('cancel')}
              </Link>
              <button type="button" className="modal-btn" onClick={() => login()}>
                Google {t('signIn')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-muted mb-1">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs"
                style={{
                  background: 'color-mix(in srgb, #ef4444 10%, transparent)',
                  color: '#ef4444',
                }}
              >
                {user.email}
              </span>
            </div>
            <div className="text-sm text-muted mb-2">관리자 권한이 없는 계정입니다.</div>
            <div className="modal-actions mt-2">
              <Link
                href="/"
                className="modal-btn cancel"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {t('cancel')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
