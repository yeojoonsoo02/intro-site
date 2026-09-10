import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — 페이지를 찾을 수 없습니다',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="meta text-lg" style={{ color: 'var(--accent)' }}>
        404
      </p>
      <h1 className="font-serif text-2xl sm:text-3xl">페이지를 찾을 수 없습니다</h1>
      <p className="text-base max-w-md" style={{ color: 'var(--ink-2)' }}>
        주소가 잘못되었거나 페이지가 이동·삭제되었을 수 있어요.
      </p>
      <Link
        href="/"
        className="btn btn-primary"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
