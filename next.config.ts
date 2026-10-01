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
  async redirects() {
    return [
      // 1차 언어가 한국어이므로 루트(`/`)가 한국어 대표본. /ko 직접 접속·기존 색인은
      // 루트로 308 통합해 중복 색인을 방지(hreflang/canonical은 ko→/ 로 매핑).
      { source: '/ko', destination: '/', permanent: true },
      // /ko/about 등 하위 경로도 같은 이유로 접두사만 떼어 넘긴다(없으면 [lang]이 'ko'를 거부해 404)
      { source: '/ko/:path+', destination: '/:path+', permanent: true },
      // TemuTemu 팀 공간은 별도 프로젝트(temutemu-task)로 분리됨 — 예전에 공유된 링크만 넘겨 준다
      { source: '/task', destination: 'https://task.yeojoonsoo02.com/', permanent: false },
      { source: '/task.html', destination: 'https://task.yeojoonsoo02.com/task.html', permanent: false },
      {
        source: '/task-timetable.html',
        destination: 'https://task.yeojoonsoo02.com/task-timetable.html',
        permanent: false,
      },
    ];
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
          // 스크립트·연결 출처는 아직 제한하지 않는다(인라인 테마 스크립트·JSON-LD·Firebase 로그인
          // 팝업이 있어 허용 목록을 로그인 흐름으로 검증한 뒤 넣어야 한다). 여기 있는 건 어떤
          // 페이지도 깨뜨리지 않는 지시문만: 프레임 삽입·<base> 바꿔치기·플러그인·외부 폼 전송 차단.
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
          },
          // X-XSS-Protection은 넣지 않는다 — 폐기된 헤더이고, 구형 브라우저의 XSS 필터는
          // 그 자체가 정보 유출 통로로 악용된 이력이 있다.
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
