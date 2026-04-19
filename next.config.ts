import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HTTPS 강제 (다운그레이드 공격 차단, HSTS preload 자격 유지)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // 클릭재킹 차단
          { key: 'X-Frame-Options', value: 'DENY' },
          // MIME 타입 우회 차단
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referer 노출 최소화
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // 민감 기능 광범위 차단 + 광고 추적 API 차단
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=(), interest-cohort=()',
          },
          // DNS 프리페치 허용 (성능)
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // Google 로그인 팝업 유지하면서 크로스오리진 공격 방어
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // 레거시 XSS 필터 (구형 브라우저 호환)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        // IndexNow 관리 API: 캐시 금지 + 검색 인덱스 제외
        source: '/api/indexnow',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        // 프로필 이미지 긴 캐시 (LCP 성능)
        source: '/profile.jpg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, must-revalidate' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
