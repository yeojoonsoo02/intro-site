import { NextResponse } from 'next/server';

interface BlogPost {
  title: string;
  link: string;
  date: string;
  description: string;
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
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? block.match(/<title>(.*?)<\/title>/)?.[1]
        ?? '';
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? '';
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
      const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? block.match(/<description>(.*?)<\/description>/)?.[1]
        ?? '';

      const cleanDesc = desc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().slice(0, 120);
      const date = pubDate ? new Date(pubDate).toLocaleDateString('ko-KR') : '';

      posts.push({ title, link, date, description: cleanDesc });
    }

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
