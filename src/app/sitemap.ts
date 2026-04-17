import type { MetadataRoute } from "next";

const SITE_URL = "https://yeojoonsoo02.com";
const LAST_MOD = new Date("2026-04-17");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MOD,
      changeFrequency: "weekly",
      priority: 1.0,
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
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ja`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/zh`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/portfolio`,
      lastModified: LAST_MOD,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
