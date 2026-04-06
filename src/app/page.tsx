'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import VisitorCount from '@/features/visitors/VisitorCount';
import FlippableProfileCard from '@/features/profile/FlippableProfileCard';

const AuthButton = dynamic(() => import('@/features/auth/AuthButton'), {
  ssr: false,
});

interface FeaturedProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  liveUrl?: string;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [angle, setAngle] = useState(0);
  const [featured, setFeatured] = useState<FeaturedProject[]>([]);

  useEffect(() => {
    const lang = i18n.language || 'ko';
    fetch(`/api/portfolio?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        const items = (data.projects ?? [])
          .filter((p: FeaturedProject & { featured: boolean }) => p.featured)
          .slice(0, 3);
        setFeatured(items);
      })
      .catch(() => null);
  }, [i18n.language]);

  return (
    <main className="max-w-xl mx-auto p-4 sm:p-6 text-center sm:min-h-[calc(100dvh-3.5rem)] sm:flex sm:flex-col">
      {angle >= 1000 && <AuthButton onAdminChange={setIsAdmin} visible />}

      <div className="sm:flex-1 sm:flex sm:flex-col sm:justify-center">
        <FlippableProfileCard isAdmin={isAdmin} onAngleChange={setAngle} />
      </div>

      {/* Featured Projects */}
      {featured.length > 0 && (
        <div className="mt-4 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold tracking-wide" style={{ color: 'var(--muted)' }}>
              {t('recentProjects')}
            </h2>
            <Link
              href="/portfolio"
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              {t('viewAllProjects')} &rarr;
            </Link>
          </div>
          <div className="space-y-2">
            {featured.map((p) => (
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

      <div className="pb-4 sm:pb-8">
        <VisitorCount />
      </div>
    </main>
  );
}
