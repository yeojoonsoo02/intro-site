import type { MetadataRoute } from 'next';
import { SITE_MODIFIED } from '@/components/seo/schemas/constants';
import { hreflangFor, LANGS, langUrl, PROFILE_IMAGE, SITE_URL } from '@/lib/site';

// 실제 콘텐츠 변경 시각(SITE_MODIFIED 단일 소스)을 lastModified로 사용.
// 빌드시각(new Date())을 쓰면 콘텐츠 무변경 배포에도 갱신돼 거짓 신선도 신호가 된다.
const LAST_MOD = new Date(SITE_MODIFIED);

export default function sitemap(): MetadataRoute.Sitemap {
  // 홈: 루트(/)가 한국어 대표본, 나머지 8개 언어는 /{lang}. hreflang으로 서로 연결해 중복 색인을 막는다.
  const homes: MetadataRoute.Sitemap = LANGS.map((lang) => ({
    url: langUrl(lang),
    lastModified: LAST_MOD,
    changeFrequency: lang === 'ko' ? 'weekly' : 'monthly',
    priority: lang === 'ko' ? 1.0 : lang === 'en' ? 0.7 : 0.6,
    ...(lang === 'ko' ? { images: [PROFILE_IMAGE] } : {}),
    alternates: { languages: hreflangFor() },
  }));

  const abouts: MetadataRoute.Sitemap = LANGS.map((lang) => ({
    url: langUrl(lang, 'about'),
    lastModified: LAST_MOD,
    changeFrequency: 'monthly',
    priority: lang === 'ko' ? 0.95 : 0.6,
    ...(lang === 'ko' ? { images: [PROFILE_IMAGE] } : {}),
    alternates: { languages: hreflangFor('about') },
  }));

  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/journey`, lastModified: LAST_MOD, changeFrequency: 'monthly', priority: 0.85, images: [PROFILE_IMAGE] },
    { url: `${SITE_URL}/portfolio`, lastModified: LAST_MOD, changeFrequency: 'weekly', priority: 0.8 },
  ];

  return [...homes, ...abouts, ...statics];
}
