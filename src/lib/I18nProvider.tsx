'use client';
import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => {
        setReady(true);
        document.documentElement.lang = i18n.language;
      });
    } else {
      document.documentElement.lang = i18n.language;
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" aria-busy="true">
        <div className="w-full max-w-[600px] mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
