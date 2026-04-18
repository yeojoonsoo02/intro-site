import type { MetadataRoute } from 'next';

// 주요 검색·AI 크롤러에 개별 규칙을 명시해 인덱싱과 AI 답변 참조를 모두 허용
const COMMON_DISALLOW = ['/api/', '/dashboard', '/login'];

const AI_BOTS = [
  'GPTBot', // OpenAI 크롤러
  'ChatGPT-User', // ChatGPT 브라우징
  'OAI-SearchBot', // ChatGPT Search 인덱싱
  'ClaudeBot', // Anthropic Claude 일반 크롤러
  'Claude-Web', // Anthropic Claude 웹 참조
  'anthropic-ai', // Anthropic 학습/참조
  'PerplexityBot', // Perplexity 인덱싱
  'Perplexity-User', // Perplexity 실시간 답변
  'Google-Extended', // Google Bard/Gemini 학습 허용 플래그
  'Applebot-Extended', // Apple Intelligence
  'Amazonbot', // Amazon (Alexa/Rufus 등)
  'Bytespider', // TikTok/ByteDance AI
  'CCBot', // Common Crawl (학습 데이터셋)
  'cohere-ai', // Cohere
  'Meta-ExternalAgent', // Meta AI 어시스턴트
  'Diffbot', // 지식 그래프 구축
  'YouBot', // You.com
];

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots['rules'] = [
    {
      userAgent: '*',
      allow: '/',
      disallow: COMMON_DISALLOW,
    },
    {
      userAgent: 'Yeti', // 네이버
      allow: '/',
      disallow: ['/api/'],
    },
    {
      userAgent: 'Googlebot',
      allow: '/',
      disallow: ['/api/'],
    },
    {
      userAgent: 'Bingbot',
      allow: '/',
      disallow: ['/api/'],
    },
    {
      userAgent: 'DuckDuckBot',
      allow: '/',
      disallow: ['/api/'],
    },
    // AI 크롤러는 공개 콘텐츠(/, /blog, /ko 등) 전체 참조를 허용.
    // 공개 프로필 사이트 특성상 AI 답변에 인용될수록 "여준수" 엔티티 인지도가 강화되므로 전면 허용.
    ...AI_BOTS.map((ua) => ({
      userAgent: ua,
      allow: '/',
      disallow: ['/api/'],
    })),
  ];

  return {
    rules,
    sitemap: 'https://yeojoonsoo02.com/sitemap.xml',
    host: 'https://yeojoonsoo02.com',
  };
}
