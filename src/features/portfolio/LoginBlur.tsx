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
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <button
          onClick={() => login()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all hover:scale-105 backdrop-blur-sm"
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
