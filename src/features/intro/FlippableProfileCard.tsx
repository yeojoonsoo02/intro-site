'use client';

import { useState } from 'react';
import SocialLinks from './SocialLinks';

const profile = {
  name: "여준수",
  tagline: "웹 개발자 & 사업가",
  email: "hello@youremail.com",
  photo: "/profile.jpg",
  interests: ["여행", "운동", "독서", "테이블테니스"],
  intro: [
    "평소 카페 탐방을 즐기며, 친구들과 운동을 하러 다녀요. 새로운 사람을 만나는 걸 좋아하고, 독서를 통해 다양한 아이디어를 얻고 있습니다.",
    "최근에는 웹 개발과 AI에 관심을 갖고 다양한 프로젝트에 도전하고 있습니다.",
  ],
  region: "경기도 김포시 운양동",
};

const devProfile = {
  name: "여준수",
  tagline: "풀스택 개발자 & AI 엔지니어",
  email: "hello@youremail.com",
  photo: "/profile.jpg",
  interests: ["TypeScript", "React", "Next.js", "Firebase", "Python", "AI", "MLOps"],
  intro: [
    "웹 프론트엔드와 백엔드, AI 모델 개발까지 폭넓게 경험하며, 사용자 경험과 기술적 완성도를 동시에 추구합니다.",
    "실전 프로젝트와 오픈소스, 스타트업 경험을 바탕으로 빠르게 성장 중입니다.",
  ],
  region: "서울시 강남구",
};

export default function FlippableProfileCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <section
      className="max-w-[600px] mx-auto mt-20 mb-8 px-2 relative"
      style={{ perspective: 1200, overflow: 'visible' }}
    >
      <button
        className="absolute top-3 right-3 z-10 bg-[#232334] text-[#E4E4E7] px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow hover:bg-[color:var(--primary)] hover:text-white transition"
        style={{ minWidth: 80, minHeight: 32 }}
        onClick={() => setFlipped(f => !f)}
        aria-label={flipped ? "일반인 프로필 보기" : "개발자 프로필 보기"}
        type="button"
      >
        {flipped ? "일반인 프로필" : "개발자 프로필"}
      </button>
      <div
        className="relative w-full min-h-[480px]"
        style={{
          perspective: 1200,
          overflow: 'visible',
        }}
      >
        <div
          className="w-full h-full"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(.4,0,.2,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* 앞면 */}
          <div
            className={`w-full h-full left-0 top-0 ${flipped ? 'absolute' : 'relative'}`}
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <ProfileCardContent profile={profile} isDev={false} />
          </div>
          {/* 뒷면 */}
          <div
            className={`w-full h-full left-0 top-0 ${flipped ? 'relative' : 'absolute'}`}
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <ProfileCardContent profile={devProfile} isDev />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileCardContent({
  profile,
  isDev,
}: {
  profile: typeof devProfile;
  isDev: boolean;
}) {
  return (
    <div
      className="w-full bg-[#27272A] dark:bg-[#27272A] rounded-[20px] shadow-lg p-6 sm:p-8 flex flex-col items-center"
      style={{
        background: "var(--card-bg, #27272A)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
        minHeight: 480,
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
      <div className="text-[2rem] font-semibold text-[#E4E4E7] mb-2">{profile.name}</div>
      <div className="text-[1.25rem] text-[#A1A1AA] mb-3">{profile.tagline}</div>
      <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
        <a
          href={`mailto:${profile.email}`}
          className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-[color:var(--primary)] transition-colors text-base"
        >
          <svg width="20" height="20" fill="currentColor" aria-hidden="true">
            <rect width="20" height="20" rx="4" fill="none" />
            <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v9A2.5 2.5 0 0 1 14.5 17h-9A2.5 2.5 0 0 1 3 14.5v-9Zm2.2.5 4.3 3.7a1 1 0 0 0 1.3 0l4.3-3.7" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          <span>{profile.email}</span>
        </a>
        <SocialLinks colored useImg />
      </div>
      <div className="w-full h-px bg-[#393940] my-6" />
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-semibold text-[#E4E4E7] mb-2">
          {isDev ? "주요 기술" : "관심사·취미"}
        </div>
        <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-1">
          {(isDev ? profile.interests : profile.interests).map((tag: string, idx: number, arr: string[]) => (
            <span
              key={tag}
              className="bg-[#323236] text-[#D4D4D8] rounded-full px-3 py-1 text-[0.875rem] font-normal"
              style={{
                marginRight: idx !== arr.length - 1 ? '6px' : 0,
              }}
            >
              {tag}
              {idx !== arr.length - 1 && <span className="mx-1 text-[#393940]">·</span>}
            </span>
          ))}
        </div>
      </div>
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-semibold text-[#E4E4E7] mb-2">소개</div>
        <div className="space-y-3 text-[#C4C4C8] text-[1rem] leading-[1.5]">
          {profile.intro.map((p: string, i: number) => (
            <p key={i} className={i !== 0 ? "mt-3" : ""}>{p}</p>
          ))}
        </div>
      </div>
      <div className="mt-4 text-[0.875rem] flex items-center justify-center text-[#B0B0B8] font-medium">
        <span className="mr-1" aria-hidden>📍</span>
        {profile.region}
      </div>
    </div>
  );
}
