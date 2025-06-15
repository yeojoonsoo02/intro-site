import { Profile } from './profile.model';
import SocialLinks from '@/features/social/SocialLinks';

export default function ProfileCardContent({ profile, isDev }: { profile: Profile; isDev: boolean }) {
  return (
    <div
      className={`
        w-full
        bg-[#27272A] dark:bg-[#27272A]
        rounded-[24px]
        shadow-[0_6px_32px_0_rgba(0,0,0,0.22),0_1.5px_6px_0_rgba(0,0,0,0.10)]
        p-6 sm:p-8 flex flex-col items-center
        transition-transform transition-shadow duration-200
        group
        will-change-transform
        hover:scale-[1.025] hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.32),0_2px_8px_0_rgba(0,0,0,0.16)]
      `}
      style={{
        background: "var(--card-bg, #27272A)",
        minHeight: 480,
        color: "var(--foreground, #18181b)",
      }}
    >
      <div className="mb-4">
        <img
          src={profile.photo}
          alt="프로필 사진"
          className={`
            w-36 h-36 rounded-full border-[6px] border-[color:var(--primary)]
            object-cover shadow-lg
            transition-transform duration-300
            group-hover:scale-105
          `}
          style={{ background: "var(--background)" }}
        />
      </div>

      <div className="text-[2.1rem] font-extrabold tracking-tight text-[#E4E4E7] mb-2">
        {profile.name}
      </div>

      <div className="text-[1.25rem] text-[#A1A1AA] font-semibold tracking-tight mb-3">
        {profile.tagline}
      </div>

      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-[color:var(--primary)] transition-colors text-base font-medium"
        >
          <svg width="20" height="20" fill="currentColor" aria-hidden="true">
            <rect width="20" height="20" rx="4" fill="none" />
            <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v9A2.5 2.5 0 0 1 14.5 17h-9A2.5 2.5 0 0 1 3 14.5v-9Zm2.2.5 4.3 3.7a1 1 0 0 0 1.3 0l4.3-3.7" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          <span>{profile.email}</span>
        </a>
        <SocialLinks colored />
      </div>

      <div className="w-full h-px bg-[#393940] my-6" />

      {/* 관심사 또는 기술 */}
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-bold tracking-tight text-[#E4E4E7] mb-2">
          {isDev ? "주요 기술" : "관심사·취미"}
        </div>
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-2">
          {profile.interests.map((tag, idx, arr) => (
            <span
              key={tag + idx}
              className={`
                bg-[#323236] dark:bg-[#323236]
                text-[#E4E4E7] dark:text-[#E4E4E7]
                rounded-full px-4 py-1.5
                text-[0.98rem] font-semibold tracking-tight
                shadow-sm border border-[#393940] dark:border-[#393940]
                flex items-center
              `}
              style={{
                marginRight: idx !== arr.length - 1 ? '6px' : 0,
              }}
            >
              {tag}
              {idx !== arr.length - 1 && <span className="mx-1 text-[#393940] font-bold">·</span>}
            </span>
          ))}
        </div>
      </div>

      {/* 소개 */}
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-bold tracking-tight text-[#E4E4E7] mb-2">소개</div>
        <div className="space-y-3 text-[#C4C4C8] text-[1.05rem] leading-[1.6] font-medium">
          {profile.intro.map((p, i) => (
            <p key={i} className={i !== 0 ? "mt-3" : ""}>{p}</p>
          ))}
        </div>
      </div>

      {/* 지역 */}
      <div className="mt-4 text-[0.95rem] flex items-center justify-center text-[#B0B0B8] font-semibold tracking-tight">
        <span className="mr-1" aria-hidden>📍</span>
        {profile.region}
      </div>
    </div>
  );
}