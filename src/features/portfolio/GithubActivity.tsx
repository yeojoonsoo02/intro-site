'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useInView from './useInView';

interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}

interface GithubStats {
  publicRepos: number;
  repos: GithubRepo[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
};

export default function GithubActivity({ username = 'yeojoonsoo02' }: { username?: string }) {
  const { t } = useTranslation();
  const { ref, inView } = useInView();
  const [stats, setStats] = useState<GithubStats | null>(null);

  useEffect(() => {
    fetch(`/api/github?user=${username}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => null);
  }, [username]);

  if (!stats) return null;

  return (
    <div
      id="github"
      ref={ref}
      role="region"
      aria-label="github activity"
      className="mb-14 sm:mb-16 scroll-mt-24 transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <h2
          className="text-sm font-bold tracking-wide"
          style={{ color: 'var(--muted)' }}
        >
          {t('githubActivity')}
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
            color: 'var(--muted)',
          }}
        >
          {stats.publicRepos} repos
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stats.repos.map((repo) => (
          <a
            key={repo.name}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>
                {repo.name}
              </span>
              {repo.stargazers_count > 0 && (
                <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>
                  ★ {repo.stargazers_count}
                </span>
              )}
            </div>
            {repo.description && (
              <p
                className="text-xs truncate mb-2"
                style={{ color: 'var(--muted)' }}
              >
                {repo.description}
              </p>
            )}
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: LANG_COLORS[repo.language] ?? 'var(--muted)' }}
                />
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {repo.language}
                </span>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
