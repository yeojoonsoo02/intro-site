'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 에러 진단 정보는 화면에 노출하지 않고 콘솔에만 기록(보안/UX)
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>치명적인 오류가 발생했습니다</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>잠시 후 다시 시도해주세요.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: '#b45309',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
            {/* global-error는 자체 <html>을 렌더하며 루트 레이아웃을 대체하므로
                next/link 대신 전체 새로고침 앵커 사용(정상 트리로 복귀) */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                background: 'transparent',
                color: '#b45309',
                border: '1px solid #b45309',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              홈으로 가기
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
