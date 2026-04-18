import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '여준수 (Yeojunsu) — 대학생 개발자 자기소개';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background:
            'linear-gradient(135deg, #0b1220 0%, #1e293b 55%, #334155 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            color: '#60a5fa',
            textTransform: 'uppercase',
          }}
        >
          Profile
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 140,
            fontWeight: 800,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          여준수
          <span
            style={{
              fontSize: 56,
              fontWeight: 500,
              color: '#94a3b8',
              marginLeft: 28,
            }}
          >
            Yeojunsu
          </span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            color: '#e2e8f0',
            lineHeight: 1.3,
          }}
        >
          대학생 개발자 · 프론트엔드 · AI 연구
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 28,
            color: '#94a3b8',
          }}
        >
          yeojoonsoo02.com
        </div>
      </div>
    ),
    { ...size },
  );
}
