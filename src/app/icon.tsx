import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #0b1220 0%, #1e293b 50%, #334155 100%)',
          borderRadius: '14px',
          fontSize: 48,
          lineHeight: 1,
        }}
      >
        🐱
      </div>
    ),
    { ...size },
  );
}
