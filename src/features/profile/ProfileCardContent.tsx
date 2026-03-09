import { Profile } from './profile.model';
import SocialLinks from '@/features/social/SocialLinks';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

export default function ProfileCardContent({ profile, isDev }: { profile: Profile; isDev: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      className={`
        w-full
        rounded-[20px] sm:rounded-[28px]
        border-[2px] sm:border-[3px]
        p-6 sm:p-8 md:p-10 flex flex-col items-center
        transition-transform duration-300
        group
        hover:scale-[1.02]
        will-change-transform
      `}
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--border)",
        boxShadow: "0 8px 36px 0 rgba(0,0,0,0.08), 0 2px 10px 0 rgba(0,0,0,0.04)",
        minHeight: 420,
        color: "var(--foreground)",
      }}
    >
      <div className="mb-4 sm:mb-5">
        <Image
          src={profile.photo}
          alt={t('profilePhoto', { defaultValue: 'profile photo' })}
          width={144}
          height={144}
          priority
          sizes="(max-width: 640px) 120px, 144px"
          className={`
            w-[120px] h-[120px] sm:w-[144px] sm:h-[144px]
            rounded-full border-[4px] sm:border-[6px] border-[color:var(--primary)]
            object-cover shadow-lg
            transition-transform duration-300
            group-hover:scale-105
          `}
          style={{ background: "var(--background)" }}
        />
      </div>

      <div
        className="text-[1.75rem] sm:text-[2.1rem] font-extrabold tracking-tight mb-1.5 text-center break-keep max-w-full px-2"
        style={{ color: "var(--foreground)" }}
      >
        {profile.name}
      </div>

      <div
        className="text-[0.95rem] sm:text-[1.05rem] font-medium tracking-tight mb-4 text-center break-keep max-w-full px-2"
        style={{ color: "var(--muted)" }}
      >
        {profile.tagline}
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-1.5 transition-colors text-sm sm:text-base font-medium min-w-0 hover:opacity-80"
          style={{ color: "var(--muted)" }}
        >
          <svg width="18" height="18" fill="none" aria-hidden="true" className="shrink-0">
            <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h9A2.5 2.5 0 0 1 16 4.5v9A2.5 2.5 0 0 1 13.5 16h-9A2.5 2.5 0 0 1 2 13.5v-9Zm1.8.5 3.8 3.3a1 1 0 0 0 1.3 0l3.8-3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="break-all">{profile.email}</span>
        </a>
        <SocialLinks colored isDev={isDev} />
      </div>

      <div className="w-12 h-[2px] mx-auto my-4 sm:my-5" style={{ background: "var(--border)" }} />

      {/* 관심사 또는 기술 */}
      <div className="w-full text-left mb-5 sm:mb-6">
        <div
          className="text-[0.8rem] sm:text-[0.85rem] font-bold tracking-wide mb-3"
          style={{ color: "var(--muted)" }}
        >
          {isDev ? t('mainSkills') : t('hobbies')}
        </div>
        <div className="flex flex-wrap gap-2">
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
              const isFirst = idx === 0;
              const baseClass = isFirst
                ? `
                  rounded-full px-4 py-2
                  text-[0.95rem] font-semibold tracking-tight
                  flex items-center break-keep max-w-full
                  transition-colors
                `
                : `
                  rounded-full px-3 sm:px-4 py-1 sm:py-1.5
                  text-[0.82rem] sm:text-[0.9rem] font-medium tracking-tight
                  flex items-center break-keep max-w-full
                  transition-colors
                `;
              if (!item.url) {
                return (
                  <span
                    key={item.label + idx}
                    className={baseClass}
                    style={{
                      background: isFirst
                        ? "color-mix(in srgb, var(--primary) 12%, transparent)"
                        : "color-mix(in srgb, var(--foreground) 8%, transparent)",
                      color: isFirst ? "var(--foreground)" : "var(--muted)",
                      border: isFirst
                        ? "1px solid color-mix(in srgb, var(--primary) 30%, transparent)"
                        : "1px solid var(--border)",
                    }}
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
                  className={`${baseClass} hover:opacity-80`}
                  style={{
                    background: isFirst
                      ? "color-mix(in srgb, var(--primary) 18%, transparent)"
                      : "color-mix(in srgb, var(--primary) 10%, transparent)",
                    color: "var(--foreground)",
                    border: isFirst
                      ? "1px solid color-mix(in srgb, var(--primary) 40%, transparent)"
                      : "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
                  }}
                >
                  {item.label}
                </a>
              );
            })}
        </div>
      </div>

      {/* 소개 */}
      <div className="w-full text-left mb-4 sm:mb-5">
        <div
          className="text-[0.8rem] sm:text-[0.85rem] font-bold tracking-wide mb-3"
          style={{ color: "var(--muted)" }}
        >
          {t('introduction')}
        </div>
        <div
          className="space-y-3 sm:space-y-4 text-[0.95rem] sm:text-[1.02rem] leading-[1.85] font-normal pl-4"
          style={{
            color: "var(--foreground)",
            opacity: 0.8,
            borderLeft: "3px solid var(--accent, var(--primary))",
          }}
        >
          {profile.intro.map((p, i) => (
            <p key={i} className="break-keep whitespace-pre-wrap overflow-wrap-anywhere">{p}</p>
          ))}
        </div>
      </div>

      {/* 지역 */}
      <div
        className="mt-2 sm:mt-3 text-[0.82rem] sm:text-[0.9rem] flex items-center justify-center font-medium"
        style={{ color: "var(--muted)" }}
      >
        <span className="mr-1.5" aria-hidden>📍</span>
        {profile.region}
      </div>
    </div>
  );
}
