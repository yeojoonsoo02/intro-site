import type { MetadataRoute } from 'next';
import { SITE_MODIFIED } from '@/components/seo/schemas/constants';

const SITE_URL = 'https://yeojoonsoo02.com';
const PROFILE_IMAGE = `${SITE_URL}/profile.jpg`;

// 실제 콘텐츠 변경 시각(SITE_MODIFIED 단일 소스)을 lastModified로 사용.
// 빌드시각(new Date())을 쓰면 콘텐츠 무변경 배포에도 갱신돼 거짓 신선도 신호가 된다.
const LAST_MOD = new Date(SITE_MODIFIED);

// 1차 언어 한국어 → 루트(/)가 ko를 대표. 영어는 /en으로 분리.
const HREFLANG_LANGUAGES = {
  ko: SITE_URL,
  en: `${SITE_URL}/en`,
  ja: `${SITE_URL}/ja`,
  zh: `${SITE_URL}/zh`,
  es: `${SITE_URL}/es`,
  fr: `${SITE_URL}/fr`,
  de: `${SITE_URL}/de`,
  pt: `${SITE_URL}/pt`,
  ru: `${SITE_URL}/ru`,
} as const;

const LOCALE_ENTRIES: ReadonlyArray<{
  url: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  withImage?: boolean;
}> = [
  // 루트(/) = 한국어 대표본. 별도 /ko 엔트리는 루트로 통합(중복 색인 방지) 후 제거.
  { url: SITE_URL, priority: 1.0, changeFrequency: 'weekly', withImage: true },
  { url: `${SITE_URL}/en`, priority: 0.7, changeFrequency: 'monthly' },
  { url: `${SITE_URL}/ja`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${SITE_URL}/zh`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${SITE_URL}/es`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${SITE_URL}/fr`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${SITE_URL}/de`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${SITE_URL}/pt`, priority: 0.6, changeFrequency: 'monthly' },
  { url: `${SITE_URL}/ru`, priority: 0.6, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locales: MetadataRoute.Sitemap = LOCALE_ENTRIES.map((entry) => ({
    url: entry.url,
    lastModified: LAST_MOD,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    ...(entry.withImage ? { images: [PROFILE_IMAGE] } : {}),
    alternates: { languages: HREFLANG_LANGUAGES },
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/about`,
      lastModified: LAST_MOD,
      changeFrequency: 'monthly',
      priority: 0.95,
      images: [PROFILE_IMAGE],
    },
    {
      url: `${SITE_URL}/journey`,
      lastModified: LAST_MOD,
      changeFrequency: 'monthly',
      priority: 0.85,
      images: [PROFILE_IMAGE],
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: LAST_MOD,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  return [...locales, ...staticPages];
}
