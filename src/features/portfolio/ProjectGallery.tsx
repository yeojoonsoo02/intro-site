'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from './portfolio.model';
import useInView from './useInView';

export default function ProjectGallery({ items }: { items: Project[] }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(items.map((p) => p.category ?? 'other'));
    return ['all', ...Array.from(cats)];
  }, [items]);

  const sorted = useMemo(() => {
    const filtered = filter === 'all' ? items : items.filter((p) => (p.category ?? 'other') === filter);
    return [...filtered].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.order - b.order;
    });
  }, [items, filter]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>
        {t('noProjects')}
      </p>
    );
  }

  const CATEGORY_LABELS: Record<string, string> = {
    all: t('allProjects', { defaultValue: '전체' }),
    web: 'Web',
    mobile: 'Mobile',
    ai: 'AI',
    other: t('etc'),
  };

  return (
    <div
      id="projects"
      ref={ref}
      role="region"
      aria-label="projects"
      className="mb-16 sm:mb-20 scroll-mt-24 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <h2
        className="text-base sm:text-lg font-bold tracking-tight mb-5"
        style={{ color: 'var(--foreground)' }}
      >
        {t('projects')}
      </h2>

      {/* 카테고리 필터 */}
      {categories.length > 2 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={
                filter === cat
                  ? {
                      background: 'var(--primary)',
                      color: 'var(--primary-contrast)',
                    }
                  : {
                      background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
                      color: 'var(--muted)',
                    }
              }
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {sorted.map((project, idx) => (
          <div
            key={project.id}
            className={`rounded-xl overflow-hidden transition-all duration-200 ${
              project.featured && idx === 0
                ? 'sm:col-span-2 hover:shadow-lg'
                : 'hover:scale-[1.02]'
            }`}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            {/* 썸네일 또는 플레이스홀더 */}
            {project.thumbnail ? (
              <div
                className="w-full h-40 sm:h-48 bg-cover bg-center"
                role="img"
                aria-label={`${project.title} thumbnail`}
                style={{ backgroundImage: `url(${project.thumbnail})` }}
              />
            ) : (
              <div
                className="w-full h-28 sm:h-32 flex items-end p-4"
                style={{
                  background: 'color-mix(in srgb, var(--primary) 6%, transparent)',
                }}
              >
                <span
                  className="text-4xl sm:text-5xl font-black select-none"
                  style={{ color: 'var(--primary)', opacity: 0.15 }}
                >
                  {project.title.charAt(0)}
                </span>
              </div>
            )}

            <div className="p-4 sm:p-5">
              <h3
                className="text-base sm:text-lg font-bold mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                {project.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-3 break-keep"
                style={{ color: 'var(--muted)' }}
              >
                {project.description}
              </p>
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                        color: 'var(--primary)',
                        border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--primary)' }}
                  >
                    {t('viewLive')} &rarr;
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium transition-opacity hover:opacity-70"
                    style={{ color: 'var(--muted)' }}
                  >
                    {t('viewRepo')} &rarr;
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
