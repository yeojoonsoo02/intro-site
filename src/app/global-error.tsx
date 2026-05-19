'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
          <p style={{ fontSize: 14, color: '#64748b' }}>
            {error.digest ? `에러 ID: ${error.digest}` : '잠시 후 다시 시도해주세요.'}
          </p>
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
        </main>
      </body>
    </html>
  );
}
