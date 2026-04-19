import { NextRequest, NextResponse } from 'next/server';
import { BLOG_POSTS } from '@/features/blog/posts';

const SITE_URL = 'https://yeojoonsoo02.com';
const SITE_HOST = 'yeojoonsoo02.com';
// IndexNow 키는 프로토콜상 퍼블릭으로 서빙되어야 하지만 소스 하드코딩은 피하기 위해 env로 분리.
// env 미설정 시 안전 fallback (기존 배포된 공개 키 파일과 일치)
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'c9d7fcf005e94200e508c6d6a8263bc6';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

// 한 엔드포인트만 호출해도 Bing·Naver·Yandex·Seznam 등 IndexNow 참여 엔진 모두 전파됨
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

// 도메인 밖 URL 제출 시도·대량 URL 공격 방어
const MAX_URLS_PER_REQUEST = 50;

function isValidSiteUrl(u: unknown): u is string {
  if (typeof u !== 'string') return false;
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && url.hostname === SITE_HOST;
  } catch {
    return false;
  }
}

function sanitizeUrls(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isValidSiteUrl).slice(0, MAX_URLS_PER_REQUEST);
}

const DEFAULT_URLS: string[] = [
  `${SITE_URL}/`,
  `${SITE_URL}/ko`,
  `${SITE_URL}/ja`,
  `${SITE_URL}/zh`,
  `${SITE_URL}/es`,
  `${SITE_URL}/fr`,
  `${SITE_URL}/de`,
  `${SITE_URL}/pt`,
  `${SITE_URL}/ru`,
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
    host: SITE_HOST,
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

// 관리자 키 검증 — INDEXNOW_ADMIN_KEY 환경변수 값과 일치해야 실행됨
function authorized(req: NextRequest): boolean {
  const expected = process.env.INDEXNOW_ADMIN_KEY;
  if (!expected) return true; // env 미설정이면 통과 (DEV 편의)
  const q = req.nextUrl.searchParams.get('key');
  const auth = req.headers.get('authorization') || '';
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7) : '';
  return q === expected || bearer === expected;
}

function unauthorized() {
  return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
}

// GET /api/indexnow?key=<admin> — 전체 기본 URL 일괄 제출
// GET /api/indexnow?url=<site-url>&key=<admin> — 특정 한 URL만 제출(도메인 제한)
export async function GET(req: NextRequest) {
  if (!authorized(req)) return unauthorized();

  const oneUrl = req.nextUrl.searchParams.get('url');

  try {
    let urls: string[];
    if (oneUrl) {
      if (!isValidSiteUrl(oneUrl)) {
        return NextResponse.json({ success: false, error: 'invalid url' }, { status: 400 });
      }
      urls = [oneUrl];
    } else {
      urls = DEFAULT_URLS;
    }
    const result = await submit(urls);
    return NextResponse.json({ success: true, ...result, submitted: urls });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}

// POST /api/indexnow  body: { urls?: string[] }
// - urls는 우리 도메인 URL만, 최대 50개로 제한
export async function POST(req: NextRequest) {
  if (!authorized(req)) return unauthorized();

  try {
    const body = (await req.json().catch(() => ({}))) as { urls?: unknown };
    const validated = sanitizeUrls(body.urls);
    const urls = validated.length > 0 ? validated : DEFAULT_URLS;
    const result = await submit(urls);
    return NextResponse.json({ success: true, ...result, submitted: urls });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    );
  }
}
