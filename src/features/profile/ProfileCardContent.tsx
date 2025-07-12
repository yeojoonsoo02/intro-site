import { Profile } from './profile.model';
import SocialLinks from '@/features/social/SocialLinks';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

export default function ProfileCardContent({ profile, isDev }: { profile: Profile; isDev: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      className={`
        w-full
        bg-[#27272A] dark:bg-[#27272A]
        rounded-[28px]
        border-[3px] border-[#5a5a5a]
        shadow-[0_8px_36px_0_rgba(0,0,0,0.3),0_2px_10px_0_rgba(0,0,0,0.15)]
        p-8 sm:p-10 flex flex-col items-center
        transition-transform duration-300
        group
        hover:scale-[1.02]
        will-change-transform
      `}
      style={{
        background: "var(--card-bg, #27272A)",
        minHeight: 480,
        color: "var(--foreground, #1e1e1e)", // 진한 텍스트 색 (라이트 모드용)
      }}
    >
      <div className="mb-4">
        <Image
          src={profile.photo}
          alt={t('profilePhoto', { defaultValue: 'profile photo' })}
          width={144}
          height={144}
          className={`
            rounded-full border-[6px] border-[color:var(--primary)]
            object-cover shadow-lg
            transition-transform duration-300
            group-hover:scale-105
          `}
          style={{ background: "var(--background)" }}
        />
      </div>

      <div className="text-[2.1rem] font-extrabold tracking-tight text-[#1e1e1e] dark:text-[#E4E4E7] mb-2">
        {profile.name}
      </div>

      <div className="text-[1.25rem] text-[#2c2c2c] dark:text-[#A1A1AA] font-semibold tracking-tight mb-3">
        {profile.tagline}
      </div>

      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-1.5 text-[#2c2c2c] dark:text-[#A1A1AA] hover:text-[color:var(--primary)] transition-colors text-base font-medium"
        >
          <svg width="20" height="20" fill="currentColor" aria-hidden="true">
            <rect width="20" height="20" rx="4" fill="none" />
            <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v9A2.5 2.5 0 0 1 14.5 17h-9A2.5 2.5 0 0 1 3 14.5v-9Zm2.2.5 4.3 3.7a1 1 0 0 0 1.3 0l4.3-3.7" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          <span>{profile.email}</span>
        </a>
        <SocialLinks colored isDev={isDev} />
      </div>

      <div className="w-full h-px bg-[#393940] my-6" />

      {/* 관심사 또는 기술 */}
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-bold tracking-tight text-[#1e1e1e] dark:text-[#E4E4E7] mb-2">
          {isDev ? t('mainSkills') : t('hobbies')}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {profile.interests
            .map(item => {
              if (typeof item === 'string') {
                return { label: item.trim() };
              }
              if (
                typeof item === 'object' &&
                'label' in item &&
                typeof item.label === 'string'
              ) {
                return {
                  label: item.label.trim(),
                  url:
                    'url' in item && typeof item.url === 'string'
                      ? item.url
                      : undefined,
                };
              }
              return { label: '' };
            })
            .filter(item => item.label !== '')
            .map((item, idx) => {
              if (!item.url) {
                return (
                  <span
                    key={item.label + idx}
                    className={`
                      bg-[#e6e6e6] dark:bg-[#323236]
                      text-[#1e1e1e]/70 dark:text-[#E4E4E7]/70
                      rounded-full px-4 py-1.5
                      text-[0.95rem] font-semibold tracking-tight
                      shadow-sm border border-[#5a5a5a]
                      flex items-center cursor-default opacity-60
                    `}
                  >
                    {item.label}
                  </span>
                );
              }
              return (
                <a
                  key={item.label + idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    bg-[#e6e6e6] dark:bg-[#323236]
                    text-[#1e1e1e] dark:text-[#E4E4E7]
                    rounded-full px-4 py-1.5
                    text-[0.95rem] font-semibold tracking-tight
                    shadow-sm border border-[#5a5a5a]
                    flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors
                  `}
                >
                  {item.label}
                </a>
              );
            })}
        </div>
      </div>

      {/* 소개 */}
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-bold tracking-tight text-[#1e1e1e] dark:text-[#E4E4E7] mb-2">{t('introduction')}</div>
        <div className="space-y-4 text-[#2c2c2c] dark:text-[#C4C4C8] text-[1.05rem] leading-7 font-medium">
          {profile.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      {/* 지역 */}
      <div className="mt-4 text-[0.95rem] flex items-center justify-center text-[#4b4b4b] dark:text-[#B0B0B8] font-semibold tracking-tight">
        <span className="mr-1" aria-hidden>📍</span>
        {t('region')}: {profile.region}
      </div>
    </div>
  );
}