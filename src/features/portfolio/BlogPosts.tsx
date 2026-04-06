'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useInView from './useInView';

interface BlogPost {
  title: string;
  link: string;
  date: string;
  description: string;
}

export default function BlogPosts() {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => null);
  }, []);

  if (posts.length === 0) return null;

  return (
    <div
      id="blog"
      ref={ref}
      role="region"
      aria-label="blog posts"
      className="mb-14 sm:mb-16 scroll-mt-24 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <h2
        className="text-sm font-bold tracking-wide mb-6"
        style={{ color: 'var(--muted)' }}
      >
        {t('blogPosts')}
      </h2>
      <div className="space-y-3">
        {posts.map((post, i) => (
          <a
            key={`${post.link}-${i}`}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3
                className="text-sm font-bold truncate"
                style={{ color: 'var(--foreground)' }}
              >
                {post.title}
              </h3>
              <span
                className="text-xs shrink-0"
                style={{ color: 'var(--muted)' }}
              >
                {post.date}
              </span>
            </div>
            {post.description && (
              <p
                className="text-xs line-clamp-2"
                style={{ color: 'var(--muted)' }}
              >
                {post.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
