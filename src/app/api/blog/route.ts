import { NextResponse } from 'next/server';

interface BlogPost {
  title: string;
  link: string;
  date: string;
  description: string;
}

// RSS에서 오는 HTML 엔티티를 안전하게 디코딩.
// 숫자 엔티티(&#NN;, &#xNN;)와 주요 이름 엔티티만 허용, 그 외는 제거.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      const n = parseInt(code.slice(2), 16);
      return Number.isFinite(n) ? String.fromCodePoint(n) : '';
    }
    if (code.startsWith('#')) {
      const n = parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : '';
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? '';
  });
}

// 위험 문자(<, >, &, " , ')를 제거한 뒤 공백만 남기도록 정리.
// 디코딩 결과를 다시 이스케이프 대상 문자가 포함되지 않도록 스트립.
function sanitizeText(raw: string, maxLen: number): string {
  const decoded = decodeEntities(raw.replace(/<[^>]*>/g, ''));
  return decoded
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

export async function GET(): Promise<NextResponse> {
  try {
    const blogId = 'chatgpt_krguide';
    const rssUrl = `https://rss.blog.naver.com/${blogId}.xml`;

    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ posts: [] });
    }

    const xml = await res.text();
    const posts: BlogPost[] = [];

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null && posts.length < 5) {
      const block = match[1];
      const rawTitle = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]
        ?? block.match(/<title>([\s\S]*?)<\/title>/)?.[1]
        ?? '';
      const rawLink = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? '';
      const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? '';
      const rawDesc = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]
        ?? block.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        ?? '';

      const title = sanitizeText(rawTitle, 200);
      const description = sanitizeText(rawDesc, 120);
      // 외부 RSS의 link는 우리 도메인이 아니라 네이버 도메인이어야 함. https만 허용.
      const link = /^https:\/\/[^\s<>"']+$/.test(rawLink) ? rawLink : '';
      const date = pubDate ? new Date(pubDate).toLocaleDateString('ko-KR') : '';

      if (!title || !link) continue;
      posts.push({ title, link, date, description });
    }

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
