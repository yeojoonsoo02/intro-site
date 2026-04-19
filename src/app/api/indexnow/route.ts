import { NextRequest, NextResponse } from 'next/server';
import { BLOG_POSTS } from '@/features/blog/posts';

const SITE_URL = 'https://yeojoonsoo02.com';
const HOST = 'yeojoonsoo02.com';
const INDEXNOW_KEY = 'c9d7fcf005e94200e508c6d6a8263bc6';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

// IndexNow는 여러 엔드포인트가 서로 동기화되므로 한 곳에만 제출하면 Bing·Naver·Yandex·Seznam 전부 전파됨.
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const DEFAULT_URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/ko`,
  `${SITE_URL}/ja`,
  `${SITE_URL}/zh`,
  `${SITE_URL}/about`,
  `${SITE_URL}/faq`,
  `${SITE_URL}/blog`,
  ...BLOG_POSTS.map((p) => `${SITE_URL}/blog/${p.slug}`),
  `${SITE_URL}/sitemap.xml`,
  `${SITE_URL}/rss.xml`,
  `${SITE_URL}/llms.txt`,
  `${SITE_URL}/llms-full.txt`,
];

async function submit(urlList: string[]) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  return { status: res.status, ok: res.ok, urlCount: urlList.length };
}

// GET /api/indexnow — 사이트 전체 URL 제출(초기 색인용)
// GET /api/indexnow?url=https://yeojoonsoo02.com/blog/foo — 특정 URL만 제출
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  try {
    const urls = url ? [url] : DEFAULT_URLS;
    const result = await submit(urls);
    return NextResponse.json({ success: true, ...result, submitted: urls });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}

// POST /api/indexnow — body: { urls: string[] }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { urls?: string[] };
    const urls = Array.isArray(body.urls) && body.urls.length > 0 ? body.urls : DEFAULT_URLS;
    const result = await submit(urls);
    return NextResponse.json({ success: true, ...result, submitted: urls });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}
