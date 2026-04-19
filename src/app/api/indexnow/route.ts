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

// 환경변수 INDEXNOW_ADMIN_KEY가 설정되어 있으면 요청에 같은 값을 함께 보내야 허용.
// 쿼리 ?key=... 또는 Authorization: Bearer <key> 헤더 중 하나면 됨. 미설정 시에는 통과(DEV 편의).
function authorized(req: NextRequest): boolean {
  const expected = process.env.INDEXNOW_ADMIN_KEY;
  if (!expected) return true;
  const q = req.nextUrl.searchParams.get('key');
  const auth = req.headers.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
  return q === expected || bearer === expected;
}

function unauthorized() {
  return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
}

// GET /api/indexnow?key=<INDEXNOW_ADMIN_KEY> — 전체 URL 제출
// GET /api/indexnow?url=<url>&key=<INDEXNOW_ADMIN_KEY> — 특정 URL만 제출
export async function GET(req: NextRequest) {
  if (!authorized(req)) return unauthorized();

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

// POST /api/indexnow — body: { urls?: string[] }, auth: Bearer 또는 ?key
export async function POST(req: NextRequest) {
  if (!authorized(req)) return unauthorized();

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
