// 네이버 블로그 "타발추"(blog.naver.com/yeojoonsoo02) RSS를 읽어 챗봇이 "요즘 근황·독서"를
// 알도록 컨텍스트로 주입한다. liveContext와 동일한 캐시 패턴.
//
// 프라이버시 설계:
// - '책' 카테고리: 제목 + 짧은 발췌(공개해도 안전, 정체성 가치 높음)
// - '일상'(일기): 제목만. 본문엔 가족·지인 실명·사적 사건이 섞여 있어 본문은 가져오지 않는다.
// - 챗봇 컨텍스트 전용(휘발성). 사이트에 렌더/색인하지 않는다.

const RSS_URL = 'https://rss.blog.naver.com/yeojoonsoo02.xml'
const TTL = 60 * 60 * 1000 // 1시간
const ALLOWED_CATEGORIES = new Set(['책', '일상'])
const BOOK_CATEGORY = '책'
const MAX_ITEMS = 8
const SNIPPET_LEN = 120

interface BlogItem {
  category: string
  title: string
  snippet: string
}

let cached: string | null = null
let cacheTime = 0
let cachePromise: Promise<string> | null = null

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

function parseRss(xml: string): BlogItem[] {
  const items: BlogItem[] = []
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
    items.push({ category, title, snippet })
    if (items.length >= MAX_ITEMS) break
  }
  return items
}

function format(items: BlogItem[]): string {
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

async function fetchAndFormat(): Promise<string> {
  try {
    const res = await fetch(RSS_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; intro-site/1.0; +https://yeojoonsoo02.com)',
      },
    })
    if (!res.ok) {
      console.error('Blog RSS error:', res.status)
      return cached || ''
    }
    const xml = await res.text()
    cached = format(parseRss(xml))
    cacheTime = Date.now()
    return cached
  } catch (err) {
    console.error('Blog RSS fetch error:', err)
    return cached || ''
  } finally {
    cachePromise = null
  }
}

export async function getBlogContext(): Promise<string> {
  const now = Date.now()
  if (cached && now - cacheTime < TTL) return cached
  if (cachePromise) return cachePromise

  cachePromise = fetchAndFormat()
  return cachePromise
}
