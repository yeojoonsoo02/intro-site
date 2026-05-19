'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <h1 className="text-2xl sm:text-3xl font-semibold">문제가 발생했어요</h1>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        잠시 후 다시 시도해주세요.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-lg text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
