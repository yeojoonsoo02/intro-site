import { useState } from 'react';
import { Profile } from './profile.model';
import SocialLinks from '@/features/social/SocialLinks';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

export default function ProfileCardContent({ profile, isDev }: { profile: Profile; isDev: boolean }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'interests' | 'intro'>('interests');

  const interests = profile.interests
    .map(item => (typeof item === 'string' ? { label: item.trim() } : { label: item.label.trim(), url: item.url }))
    .filter(item => item.label !== '');

  return (
    <div className="w-full space-y-6">
      <div className="glass-card text-center flex flex-col items-center">
        <div className="mb-4">
          <Image
            src={profile.photo}
            alt={t('profilePhoto', { defaultValue: 'profile photo' })}
            width={144}
            height={144}
            className="rounded-full border-[6px] border-[color:var(--primary)] object-cover shadow-lg"
            style={{ background: 'var(--background)' }}
          />
        </div>
        <div className="text-2xl font-extrabold tracking-tight mb-1">{profile.name}</div>
        <div className="text-lg font-semibold text-muted mb-2">{profile.tagline}</div>
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-1.5 hover:text-[color:var(--primary)] transition-colors text-sm font-medium"
        >
          <svg width="20" height="20" fill="currentColor" aria-hidden="true">
            <rect width="20" height="20" rx="4" fill="none" />
            <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v9A2.5 2.5 0 0 1 14.5 17h-9A2.5 2.5 0 0 1 3 14.5v-9Zm2.2.5 4.3 3.7a1 1 0 0 0 1.3 0l4.3-3.7" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
          <span>{profile.email}</span>
        </a>
        <div className="mt-4 text-sm font-semibold flex items-center justify-center">
          <span className="mr-1" aria-hidden>📍</span>
          {t('region')}: {profile.region}
        </div>
      </div>

      <div className="glass-card">
        <div className="flex justify-center mb-4 gap-2">
          <button
            type="button"
            onClick={() => setTab('interests')}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${tab === 'interests' ? 'bg-blue-600 text-white' : 'bg-white/10'}`}
          >
            {isDev ? t('mainSkills') : t('hobbies')}
          </button>
          <button
            type="button"
            onClick={() => setTab('intro')}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${tab === 'intro' ? 'bg-blue-600 text-white' : 'bg-white/10'}`}
          >
            {t('introduction')}
          </button>
        </div>
        {tab === 'interests' ? (
          <div className="flex flex-wrap justify-center gap-2">
            {interests.map((item, idx) => (
              item.url ? (
                <a
                  key={item.label + idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 rounded-full px-4 py-1.5 text-sm font-semibold"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  key={item.label + idx}
                  className="bg-white/10 rounded-full px-4 py-1.5 text-sm font-semibold text-white/70"
                >
                  {item.label}
                </span>
              )
            ))}
          </div>
        ) : (
          <div className="space-y-4 text-sm leading-6 text-center">
            {profile.intro.map((p, i) => (
              <p key={i} className="break-keep whitespace-pre-wrap">
                {p}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card text-center">
        <SocialLinks colored isDev={isDev} />
      </div>
    </div>
  );
}