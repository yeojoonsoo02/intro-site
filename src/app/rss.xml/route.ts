import { BLOG_POSTS } from '@/features/blog/posts';

const SITE_URL = 'https://yeojoonsoo02.com';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const sorted = [...BLOG_POSTS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  const items = sorted
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(p.description)}</description>
      <author>yeojoonsoo02@gmail.com (여준수)</author>
      ${p.tags.map((t) => `<category>${escapeXml(t)}</category>`).join('')}
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>여준수 (Yeojunsu) 블로그</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>대학생 개발자 여준수의 개발 일지와 프로젝트 회고</description>
    <language>ko-KR</language>
    <copyright>© 여준수 (Yeojunsu)</copyright>
    <managingEditor>yeojoonsoo02@gmail.com (여준수)</managingEditor>
    <webMaster>yeojoonsoo02@gmail.com (여준수)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
