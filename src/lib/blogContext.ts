import { cached } from '@/lib/cached'

// 네이버 블로그 "타발추"(blog.naver.com/yeojoonsoo02) RSS를 읽어 챗봇이 "요즘 근황·독서"를
// 알도록 컨텍스트로 주입한다.
//
// 무엇을 어디에 쓰는가:
// - 챗봇: 모든 글의 제목 + RSS에 실린 본문 앞부분(네이버가 360자쯤에서 자른다). 일기도 포함한다 —
//   공개 블로그에 본인이 올린 글이고, "너무 위험한 것만 빼고 다 준다"가 본인 결정이다(2026-10-01).
//   그 전에는 일기를 제목만 넘겨서 "8월에 뭐 했어?"에 "여행 다녀오고 일기를 남겼어"밖에 못 했다.
// - 사이트(/about의 최근 글): 제목·링크·날짜, 그리고 서평('책')에만 짧은 발췌. 화면은 그대로다.

const RSS_URL = 'https://rss.blog.naver.com/yeojoonsoo02.xml'
const TTL = 24 * 60 * 60 * 1000 // 24시간 — 블로그 글 빈도상 하루 1회 갱신으로 충분
const ERROR_TTL = 5 * 60 * 1000 // RSS 실패 시 재시도 간격
// 네이버가 응답하지 않으면 챗 요청과 /about 렌더가 같이 멈춘다. 끊고 직전 값으로 간다.
const TIMEOUT_MS = 8000
const ALLOWED_CATEGORIES = new Set(['책', '일상'])
const BOOK_CATEGORY = '책'
// 일기가 몰아서 올라오면 8건 창에 서평이 안 들어온다. 창을 조금 넓혀
// 챗봇·사이트 양쪽이 "최근 근황"과 "요즘 읽은 책"을 함께 확보하게 한다.
const MAX_ITEMS = 12
const SNIPPET_LEN = 120
// RSS description이 원래 360자 안팎이라 사실상 전부다.
const EXCERPT_LEN = 400

// 렌더에도 쓰이므로 export한다.
export interface BlogPost {
  category: string
  title: string
  /** 사이트에 보여주는 짧은 발췌. '책'에만 채워진다. */
  snippet: string
  /** 챗봇에 넘기는 본문 앞부분. 모든 글에 채워진다. */
  excerpt: string
  /** 원문 링크. blog.naver.com 호스트만 통과시킨다. */
  link: string
  /** ISO 문자열. 파싱 실패 시 빈 문자열 */
  date: string
}

// RSS는 외부 입력이다. 피드가 오염돼도 우리 페이지가 임의 호스트로 링크하지 않도록 막는다.
const ALLOWED_LINK_HOST = 'blog.naver.com'


function decode(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

function clean(s: string): string {
  // 실제 HTML 태그(<p>, <br/>, <img ...>)만 제거. 책 제목처럼 한글로 시작하는
  // 꺾쇠(<모두에게 사랑받을 필요는 없다>)는 태그가 아니므로 보존한다.
  return decode(s.replace(/<\/?[a-zA-Z][^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function firstCdata(block: string, tag: string): string {
  const m = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`).exec(block)
  return m ? m[1] : ''
}

// guid·pubDate는 CDATA로 감싸지 않고 오는 경우가 있어 양쪽을 모두 받는다.
function firstTag(block: string, tag: string): string {
  const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(block)
  if (!m) return ''
  const inner = m[1].trim()
  const cdata = /^<!\[CDATA\[([\s\S]*?)\]\]>$/.exec(inner)
  return (cdata ? cdata[1] : inner).trim()
}

// 링크는 guid(쿼리 없는 정규 주소)를 우선한다. link에는 ?fromRss=true 추적 파라미터가 붙는다.
function pickLink(block: string): string {
  for (const raw of [firstTag(block, 'guid'), firstTag(block, 'link')]) {
    if (!raw) continue
    try {
      const url = new URL(decode(raw))
      if (url.protocol !== 'https:') continue
      if (url.hostname !== ALLOWED_LINK_HOST) continue
      url.search = ''
      return url.toString()
    } catch {
      continue
    }
  }
  return ''
}

function pickDate(block: string): string {
  const raw = firstTag(block, 'pubDate')
  if (!raw) return ''
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

function parseRss(xml: string): BlogPost[] {
  const items: BlogPost[] = []
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  for (const block of blocks) {
    const category = clean(firstCdata(block, 'category'))
    if (!ALLOWED_CATEGORIES.has(category)) continue
    const title = clean(firstCdata(block, 'title'))
    if (!title) continue
    const body = clean(firstCdata(block, 'description'))
    const snippet = category === BOOK_CATEGORY ? body.slice(0, SNIPPET_LEN) : ''
    items.push({
      category,
      title,
      snippet,
      excerpt: body.slice(0, EXCERPT_LEN),
      link: pickLink(block),
      date: pickDate(block),
    })
    if (items.length >= MAX_ITEMS) break
  }
  return items
}

function format(items: BlogPost[]): string {
  if (items.length === 0) return ''
  const lines = items.map((it) => {
    const when = it.date ? ` (${it.date.slice(0, 10)} 게시)` : ''
    return it.excerpt
      ? `- [${it.category}] ${it.title}${when} — ${it.excerpt}…`
      : `- [${it.category}] ${it.title}${when}`
  })
  return [
    '# 최근 블로그 (네이버 블로그 "타발추", 최신순)',
    '내가 직접 쓴 글의 앞부분. 요즘 근황·다녀온 곳·읽은 책 질문에 활용. 글이 "…"로 끊긴 뒤의 내용은 모른다.',
    '블로그용 존댓말("~습니다")로 쓰여 있다. 내용만 가져오고 글의 말투는 따라 하지 말 것.',
    '',
    ...lines,
  ].join('\n')
}

async function fetchPosts(): Promise<BlogPost[]> {
  const res = await fetch(RSS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; intro-site/1.0; +https://yeojoonsoo02.com)',
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Blog RSS ${res.status}`)
  return parseRss(await res.text())
}

// 챗봇 컨텍스트 문자열이 아니라 파싱 결과를 캐시한다 — 챗봇과 사이트가 한 번의 RSS
// 호출을 나눠 쓰기 위함(TTL 24시간, 외부 호출은 늘지 않는다).
const getPosts = cached(fetchPosts, [], { ttl: TTL, errorTtl: ERROR_TTL, name: 'blogContext' })

/** 챗봇 시스템 프롬프트에 넣을 근황 컨텍스트(문자열). */
export async function getBlogContext(): Promise<string> {
  return format(await getPosts())
}

/**
 * 사이트 렌더용 최근 글. 링크가 없는 항목은 걸러 클릭할 수 없는 줄이 남지 않게 한다.
 * RSS는 최신순으로 오므로 정렬을 다시 하지 않는다.
 */
export async function getRecentPosts(limit = 4): Promise<BlogPost[]> {
  const posts = (await getPosts()).filter((p) => p.link)
  const recent = posts.slice(0, limit)

  // 일기 빈도가 서평보다 높아 최신 N건이 전부 '일상'으로 채워지는 일이 잦다.
  // 독서 이력은 근황보다 오래 남는 신호라, 한 건도 없을 때만 마지막 칸을 양보한다.
  if (recent.length === limit && !recent.some((p) => p.category === BOOK_CATEGORY)) {
    const book = posts.find((p) => p.category === BOOK_CATEGORY)
    if (book) recent[limit - 1] = book
  }

  return recent
}
