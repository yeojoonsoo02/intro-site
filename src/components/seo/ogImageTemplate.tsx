import { ImageResponse } from 'next/og';

// OG/Twitter 카드 공통 규격·문구. opengraph-image / twitter-image 가 함께 사용한다.
export const OG_ALT = '여준수 (Yeojunsu) — 대학생 개발자 자기소개';
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

// 부제는 검증된 사실(직업·소속)만 사용한다. 미검증 키워드는 넣지 않는다.
const SUBTITLE = '대학생 개발자 · 광운대 소프트웨어학과';

export function renderOgImage(): ImageResponse {
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
          {SUBTITLE}
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
    { ...OG_SIZE },
  );
}
