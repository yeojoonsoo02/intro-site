import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getPostBySlug } from '@/features/blog/posts';

const SITE_URL = 'https://yeojoonsoo02.com';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — 여준수`,
    description: post.description,
    keywords: ['여준수', 'Yeo Joonsoo', ...post.tags],
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: ['여준수'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${SITE_URL}/blog/${post.slug}#blogposting`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: 'ko-KR',
    keywords: post.tags.join(', '),
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}#person`,
      name: '여준수',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: '여준수',
      url: SITE_URL,
    },
    image: `${SITE_URL}/profile.jpg`,
  };

  // 초간단 마크다운 렌더 — 외부 의존성 없이 기본 서식만 처리
  const paragraphs = post.content.split(/\n\n+/);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            <span>·</span>
            <span>여준수 (Yeo Joonsoo)</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            {post.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 border border-gray-200 dark:border-gray-800 rounded-full">
                #{t}
              </span>
            ))}
          </div>
        </header>

        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none leading-relaxed">
          {paragraphs.map((para, i) => {
            const trimmed = para.trim();
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={i} className="text-xl font-semibold mt-8 mb-3">
                  {trimmed.slice(3)}
                </h2>
              );
            }
            if (trimmed.startsWith('- ')) {
              const items = trimmed.split('\n').map((l) => l.replace(/^-\s+/, ''));
              return (
                <ul key={i} className="list-disc ml-6 my-3 space-y-1">
                  {items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="my-3 whitespace-pre-line">
                {trimmed}
              </p>
            );
          })}
        </div>
      </article>

      <nav className="mt-14 text-sm">
        <Link href="/blog" className="underline-offset-4 hover:underline">
          ← 여준수 블로그 목록으로
        </Link>
      </nav>
    </main>
  );
}
