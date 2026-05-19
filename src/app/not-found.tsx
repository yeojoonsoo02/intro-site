import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — 페이지를 찾을 수 없습니다',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-5xl font-semibold tracking-tight" style={{ color: 'var(--primary)' }}>
        404
      </p>
      <h1 className="text-xl sm:text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm max-w-md" style={{ color: 'var(--muted)' }}>
        주소가 잘못되었거나 페이지가 이동·삭제되었을 수 있어요.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg text-white"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
