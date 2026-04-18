import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS } from '@/features/blog/posts';

const SITE_URL = 'https://yeojoonsoo02.com';

export const metadata: Metadata = {
  title: '여준수 블로그 — 개발·자기소개·회고',
  description:
    '대학생 개발자 여준수(Yeo Joonsoo)가 쓰는 개발 일지와 프로젝트 회고 모음. 프론트엔드, Next.js, AI, 개인 브랜딩에 대한 기록.',
  keywords: [
    '여준수',
    '여준수 블로그',
    'Yeo Joonsoo blog',
    '개발자 블로그',
    '프론트엔드 회고',
    'Next.js',
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: '여준수 블로그',
    description: '대학생 개발자 여준수의 개발 일지와 회고',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
};

export default function BlogIndex() {
  const sorted = [...BLOG_POSTS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: '여준수 블로그',
    url: `${SITE_URL}/blog`,
    author: { '@type': 'Person', name: '여준수', url: SITE_URL },
    blogPost: sorted.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      author: { '@type': 'Person', name: '여준수' },
    })),
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-bold">여준수 블로그</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          대학생 개발자 여준수(Yeo Joonsoo)의 개발 일지와 프로젝트 회고.
        </p>
      </header>

      <ul className="space-y-6">
        {sorted.map((post) => (
          <li key={post.slug} className="border-b border-gray-100 dark:border-gray-800 pb-6">
            <Link href={`/blog/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold group-hover:underline">
                {post.title}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {post.description}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                <span>·</span>
                <span>{post.tags.slice(0, 3).join(', ')}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <nav className="mt-12 text-sm">
        <Link href="/" className="underline-offset-4 hover:underline">
          ← 여준수 프로필 홈으로
        </Link>
      </nav>
    </main>
  );
}
