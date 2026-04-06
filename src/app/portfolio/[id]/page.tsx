'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthProvider';
import Link from 'next/link';
import type { Project } from '@/features/portfolio/portfolio.model';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user, login, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lang = i18n.language || 'ko';
    fetch(`/api/portfolio?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        const items: Project[] = data.projects ?? [];
        setAllProjects(items);
        setProject(items.find((p) => p.id === id) ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, i18n.language]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--muted)' }}>{t('loading')}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--muted)' }}>{t('loginToView')}</p>
        <button
          onClick={() => login()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'var(--primary)', color: 'var(--primary-contrast)' }}
        >
          {t('loginWithGoogle')}
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--muted)' }}>Project not found</p>
        <Link href="/portfolio" className="text-sm" style={{ color: 'var(--primary)' }}>
          {t('viewAllProjects')} &rarr;
        </Link>
      </div>
    );
  }

  const relatedProjects = allProjects
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, 3);

  return (
    <main style={{ background: 'var(--background)' }}>
      <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 pb-20">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1 text-xs mb-8 transition-opacity hover:opacity-70"
          style={{ color: 'var(--muted)' }}
        >
          &larr; {t('viewAllProjects')}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              {project.title}
            </h1>
            {project.featured && (
              <span
                className="text-xs px-2 py-1 rounded shrink-0"
                style={{
                  background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  color: 'var(--primary)',
                }}
              >
                Featured
              </span>
            )}
          </div>
          <p
            className="text-base leading-relaxed break-keep"
            style={{ color: 'var(--muted)' }}
          >
            {project.description}
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-3 mb-8">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: 'var(--primary)', color: 'var(--primary-contrast)' }}
            >
              {t('viewLive')} &rarr;
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: 'color-mix(in srgb, var(--foreground) 8%, transparent)',
                color: 'var(--foreground)',
              }}
            >
              {t('viewRepo')} &rarr;
            </a>
          )}
        </div>

        {/* Tech Stack */}
        {project.tags.length > 0 && (
          <div className="mb-10">
            <h2
              className="text-sm font-bold tracking-wide mb-3"
              style={{ color: 'var(--muted)' }}
            >
              {t('techStack')}
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg text-sm"
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
          </div>
        )}

        {/* Thumbnail */}
        {project.thumbnail && (
          <div className="mb-10 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <img
              src={project.thumbnail}
              alt={`${project.title} screenshot`}
              className="w-full"
            />
          </div>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <h2
              className="text-sm font-bold tracking-wide mb-4"
              style={{ color: 'var(--muted)' }}
            >
              {t('recentProjects')}
            </h2>
            <div className="space-y-3">
              {relatedProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/portfolio/${p.id}`}
                  className="block px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    {p.title}
                  </span>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                    {p.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
