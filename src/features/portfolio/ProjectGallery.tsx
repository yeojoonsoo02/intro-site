'use client';

import { useTranslation } from 'react-i18next';
import type { Project } from './portfolio.model';

export default function ProjectGallery({ items }: { items: Project[] }) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>
        {t('noProjects')}
      </p>
    );
  }

  const sorted = [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.order - b.order;
  });

  return (
    <section className="mb-16 sm:mb-20">
      <h2
        className="text-sm font-bold tracking-wide mb-6"
        style={{ color: 'var(--muted)' }}
      >
        {t('projects')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {sorted.map((project, idx) => (
          <div
            key={project.id}
            className={`rounded-xl overflow-hidden transition-transform duration-200 hover:scale-[1.02] ${
              project.featured && idx === 0 ? 'sm:col-span-2' : ''
            }`}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            {project.thumbnail && (
              <div
                className="w-full h-40 sm:h-48 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${project.thumbnail})`,
                  backgroundColor: 'color-mix(in srgb, var(--foreground) 5%, transparent)',
                }}
              />
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
                    {t('viewLive')} →
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
                    {t('viewRepo')} →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
