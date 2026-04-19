import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/features/blog/posts';

const SITE_URL = 'https://yeojoonsoo02.com';
const LAST_MOD = new Date('2026-04-19');
const PROFILE_IMAGE = `${SITE_URL}/profile.jpg`;

export default function sitemap(): MetadataRoute.Sitemap {
  const core: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: LAST_MOD,
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [PROFILE_IMAGE],
      alternates: {
        languages: {
          ko: `${SITE_URL}/ko`,
          en: SITE_URL,
          ja: `${SITE_URL}/ja`,
          zh: `${SITE_URL}/zh`,
        },
      },
    },
    {
      url: `${SITE_URL}/ko`,
      lastModified: LAST_MOD,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: [PROFILE_IMAGE],
    },
    {
      url: `${SITE_URL}/ja`,
      lastModified: LAST_MOD,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/zh`,
      lastModified: LAST_MOD,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: LAST_MOD,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: LAST_MOD,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const posts: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...core, ...posts];
}
