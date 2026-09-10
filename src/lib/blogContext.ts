import { cached } from '@/lib/cached'

// 네이버 블로그 "타발추"(blog.naver.com/yeojoonsoo02) RSS를 읽어 챗봇이 "요즘 근황·독서"를
// 알도록 컨텍스트로 주입한다.
//
// 프라이버시 설계:
// - '책' 카테고리: 제목 + 짧은 발췌(공개해도 안전, 정체성 가치 높음)
// - '일상'(일기): 제목만. 본문엔 가족·지인 실명·사적 사건이 섞여 있어 본문은 가져오지 않는다.
// - 사이트 렌더는 제목·링크·날짜만(getRecentPosts). 일기 본문은 어디에도 나가지 않는다.
//   책 발췌는 챗봇 컨텍스트와 사이트 양쪽에 쓴다 — 공개 서평이라 원래 공개 정보다.

const RSS_URL = 'https://rss.blog.naver.com/yeojoonsoo02.xml'
const TTL = 24 * 60 * 60 * 1000 // 24시간 — 블로그 글 빈도상 하루 1회 갱신으로 충분
const ERROR_TTL = 5 * 60 * 1000 // RSS 실패 시 재시도 간격
const ALLOWED_CATEGORIES = new Set(['책', '일상'])
const BOOK_CATEGORY = '책'
// 일기가 몰아서 올라오면 8건 창에 서평이 안 들어온다. 창을 조금 넓혀
// 챗봇·사이트 양쪽이 "최근 근황"과 "요즘 읽은 책"을 함께 확보하게 한다.
const MAX_ITEMS = 12
const SNIPPET_LEN = 120

// 렌더에도 쓰이므로 export한다. snippet은 '책'에만 채워진다(위 프라이버시 설계).
export interface BlogPost {
  category: string
  title: string
  snippet: string
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
    // 일기(일상)는 제3자 정보 보호를 위해 제목만. 책은 짧은 발췌 포함.
    const snippet =
      category === BOOK_CATEGORY
        ? clean(firstCdata(block, 'description')).slice(0, SNIPPET_LEN)
        : ''
    items.push({ category, title, snippet, link: pickLink(block), date: pickDate(block) })
    if (items.length >= MAX_ITEMS) break
  }
  return items
}

function format(items: BlogPost[]): string {
  if (items.length === 0) return ''
  const lines = items.map((it) =>
    it.snippet
      ? `- [${it.category}] ${it.title} — ${it.snippet}…`
      : `- [${it.category}] ${it.title}`,
  )
  return [
    '# 최근 블로그 (네이버 블로그 "타발추", 최신순)',
    '요즘 읽은 책·근황. "요즘 뭐 해/뭐 읽어" 류 질문에 활용.',
    '',
    ...lines,
  ].join('\n')
}

async function fetchPosts(): Promise<BlogPost[]> {
  const res = await fetch(RSS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; intro-site/1.0; +https://yeojoonsoo02.com)',
    },
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
