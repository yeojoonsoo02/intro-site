import { Profile } from './profile.model';
import SocialLinks from '@/features/social/SocialLinks';

export default function ProfileCardContent({ profile, isDev }: { profile: Profile; isDev: boolean }) {
  return (
    <div
      className="
        w-full
        bg-[#27272A] dark:bg-[#27272A]
        rounded-[20px] shadow-lg p-6 sm:p-8 flex flex-col items-center
        text-[#E4E4E7] dark:text-[#E4E4E7]
      "
      style={{
        background: "var(--card-bg, #27272A)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
        minHeight: 480,
        color: "var(--foreground, #18181b)",
      }}
    >
      <div className="mb-4">
        <img
          src={profile.photo}
          alt="프로필 사진"
          className="w-32 h-32 rounded-full border-4 border-[color:var(--primary)] object-cover shadow"
          style={{ background: "var(--background)" }}
        />
      </div>
      <div className="text-[2rem] font-semibold text-[#18181b] dark:text-[#E4E4E7] mb-2">{profile.name}</div>
      <div className="text-[1.25rem] text-[#232334] dark:text-[#A1A1AA] mb-3">{profile.tagline}</div>
      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-1.5 text-[#232334] dark:text-[#A1A1AA] hover:text-[color:var(--primary)] transition-colors text-base"
        >
          <svg width="20" height="20" fill="currentColor" aria-hidden="true">
            <rect width="20" height="20" rx="4" fill="none" />
            <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v9A2.5 2.5 0 0 1 14.5 17h-9A2.5 2.5 0 0 1 3 14.5v-9Zm2.2.5 4.3 3.7a1 1 0 0 0 1.3 0l4.3-3.7" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          <span>{profile.email}</span>
        </a>
        <SocialLinks colored/>
      </div>
      <div className="w-full h-px bg-[#393940] my-6" />
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-semibold text-[#18181b] dark:text-[#E4E4E7] mb-2">
          {isDev ? "주요 기술" : "관심사·취미"}
        </div>
        <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-1">
          {profile.interests.map((tag, idx, arr) => (
            <span
              key={tag + idx}
              className="bg-[#ececec] dark:bg-[#323236] text-[#232334] dark:text-[#D4D4D8] rounded-full px-3 py-1 text-[0.875rem] font-normal"
              style={{
                marginRight: idx !== arr.length - 1 ? '6px' : 0,
              }}
            >
              {tag}
              {idx !== arr.length - 1 && <span className="mx-1 text-[#bdbdbd] dark:text-[#393940]">·</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-semibold text-[#18181b] dark:text-[#E4E4E7] mb-2">소개</div>
        <div className="space-y-3 text-[#232334] dark:text-[#C4C4C8] text-[1rem] leading-[1.5]">
          {profile.intro.map((p, i) => (
            <p key={i} className={i !== 0 ? "mt-3" : ""}>{p}</p>
          ))}
        </div>
      </div>
      <div className="mt-4 text-[0.875rem] flex items-center justify-center text-[#6b7280] dark:text-[#B0B0B8] font-medium">
        <span className="mr-1" aria-hidden>📍</span>
        {profile.region}
      </div>
    </div>
  );
}
