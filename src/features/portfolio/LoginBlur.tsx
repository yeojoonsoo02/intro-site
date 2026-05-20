'use client';

import { useAuth } from '@/lib/AuthProvider';
import { useTranslation } from 'react-i18next';

interface LoginBlurProps {
  children: React.ReactNode;
  fallbackHeight?: string;
}

export default function LoginBlur({ children, fallbackHeight = 'auto' }: LoginBlurProps) {
  const { user, login, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return <div style={{ minHeight: fallbackHeight }} />;
  if (user) return <>{children}</>;

  return (
    <div className="relative" style={{ minHeight: fallbackHeight }}>
      <div
        className="select-none pointer-events-none"
        style={{ filter: 'blur(6px)', WebkitFilter: 'blur(6px)' }}
        aria-hidden="true"
      >
        {children}
      </div>
      {/* viewport에 고정해 스크롤 위치와 무관하게 항상 보이도록 처리.
          LoginBlur는 로그인 시 unmount되므로 fixed 잔존 우려 없음. */}
      <div className="fixed inset-x-0 top-1/3 z-30 flex justify-center px-4 pointer-events-none">
        <button
          onClick={() => login()}
          className="pointer-events-auto px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all hover:scale-105 backdrop-blur-sm"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-contrast)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {t('loginToView')}
        </button>
      </div>
    </div>
  );
}
