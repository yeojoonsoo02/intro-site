import type { MetadataRoute } from 'next';

const SITE_URL = 'https://yeojoonsoo02.com';
const PROFILE_IMAGE = `${SITE_URL}/profile.jpg`;

// 빌드 시점을 lastModified로 사용해 sitemap 신선도를 자동 유지
const LAST_MOD = new Date();

const HREFLANG_LANGUAGES = {
  ko: `${SITE_URL}/ko`,
  en: SITE_URL,
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
  { url: SITE_URL, priority: 1.0, changeFrequency: 'weekly', withImage: true },
  { url: `${SITE_URL}/ko`, priority: 0.9, changeFrequency: 'weekly', withImage: true },
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
