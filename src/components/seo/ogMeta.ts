// OG/Twitter 카드의 규격·문구와, 페이지 메타데이터에 넣을 이미지 항목.
// next/og(ImageResponse)를 끌어오지 않도록 템플릿과 분리해 둔다 — 모든 페이지가 이 파일을 import한다.
export const OG_ALT = '여준수 (Junsu Yeo) — 대학생 개발자 자기소개';
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

// 이미지는 /opengraph-image·/twitter-image 라우트가 그린다(app/opengraph-image.tsx).
// 페이지가 자기 openGraph를 정의하면 상위의 이미지가 사라지므로(얕은 병합), openGraph를
// 정의하는 곳마다 이 값을 함께 넣는다. 예전엔 홈을 뺀 모든 페이지에 og:image가 없었다.
export const OG_IMAGES = [
  { url: '/opengraph-image', ...OG_SIZE, alt: OG_ALT, type: OG_CONTENT_TYPE },
];
export const TWITTER_IMAGES = [
  { url: '/twitter-image', ...OG_SIZE, alt: OG_ALT, type: OG_CONTENT_TYPE },
];
