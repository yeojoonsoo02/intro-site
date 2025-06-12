'use client';

import { useState, useEffect, useRef } from 'react';
import SocialLinks from '@/features/social/SocialLinks';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Profile = {
  name: string;
  tagline: string;
  email: string;
  photo: string;
  interests: string[];
  intro: string[];
  region: string;
};

const defaultProfile: Profile = {
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

const defaultDevProfile: Profile = {
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

function useDebouncedSave(profile: Profile, saveFn: (p: Profile) => void, delay = 500) {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => saveFn(profile), delay);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [profile, saveFn, delay]);
}

export default function FlippableProfileCard({ isAdmin = false }: { isAdmin?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [devProfile, setDevProfile] = useState<Profile>(defaultDevProfile);

  // 일반인 프로필 불러오기
  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, 'profiles', 'main');
        const snap = await getDoc(ref);
        if (snap.exists()) setProfile(snap.data() as Profile);
      } catch {}
    })();
  }, []);

  // 개발자 프로필 불러오기
  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, 'profiles', 'dev');
        const snap = await getDoc(ref);
        if (snap.exists()) setDevProfile(snap.data() as Profile);
      } catch {}
    })();
  }, []);

  // 일반인 프로필 저장 (debounced)
  useDebouncedSave(profile, async (nextProfile) => {
    await setDoc(doc(db, 'profiles', 'main'), nextProfile, { merge: true });
  });

  // 개발자 프로필 저장 (debounced)
  useDebouncedSave(devProfile, async (nextProfile) => {
    await setDoc(doc(db, 'profiles', 'dev'), nextProfile, { merge: true });
  });

  // 일반인 프로필 핸들러
  const handleProfileChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: field === "interests" ? value.split(',').map(v => v.trim()).filter(Boolean) : value,
    }));
  };
  const handleProfileIntroChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      intro: value.split('\n').filter(Boolean),
    }));
  };
  const handleProfileRegionChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      region: value,
    }));
  };

  // 개발자 프로필 핸들러
  const handleDevProfileChange = (field: keyof Profile, value: string) => {
    setDevProfile((prev) => ({
      ...prev,
      [field]: field === "interests" ? value.split(',').map(v => v.trim()).filter(Boolean) : value,
    }));
  };
  const handleDevProfileIntroChange = (value: string) => {
    setDevProfile((prev) => ({
      ...prev,
      intro: value.split('\n').filter(Boolean),
    }));
  };
  const handleDevProfileRegionChange = (value: string) => {
    setDevProfile((prev) => ({
      ...prev,
      region: value,
    }));
  };

  return (
    <section className="max-w-[600px] mx-auto mt-20 mb-8 px-2 relative" style={{ perspective: 1200, overflow: 'visible' }}>
      <FlipButton flipped={flipped} setFlipped={setFlipped} />
      <div className="relative w-full min-h-[480px]" style={{ perspective: 1200, overflow: 'visible' }}>
        <div
          className="w-full h-full"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(.4,0,.2,1)",
            willChange: "transform",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* 앞면 */}
          <div className={`w-full h-full left-0 top-0 ${flipped ? 'absolute' : 'relative'}`} style={{ backfaceVisibility: "hidden" }}>
            <ProfileCardContent
              profile={profile}
              isDev={false}
              isAdmin={isAdmin}
              onProfileChange={handleProfileChange}
              onProfileIntroChange={handleProfileIntroChange}
              onProfileRegionChange={handleProfileRegionChange}
            />
          </div>
          {/* 뒷면 */}
          <div className={`w-full h-full left-0 top-0 ${flipped ? 'relative' : 'absolute'}`} style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
            <ProfileCardContent
              profile={devProfile}
              isDev
              isAdmin={isAdmin}
              onProfileChange={handleDevProfileChange}
              onProfileIntroChange={handleDevProfileIntroChange}
              onProfileRegionChange={handleDevProfileRegionChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FlipButton({ flipped, setFlipped }: { flipped: boolean; setFlipped: (f: boolean) => void }) {
  return (
    <button
      className="absolute top-3 right-3 z-10 bg-[#232334] text-[#E4E4E7] px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow hover:bg-[color:var(--primary)] hover:text-white transition flex items-center gap-1"
      style={{
        minWidth: 80,
        minHeight: 32,
        willChange: 'transform',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
      }}
      onClick={() => setFlipped(!flipped)}
      aria-label={flipped ? "일반인 프로필 보기" : "개발자 프로필 보기"}
      type="button"
    >
      <span className="inline-block transition-transform duration-500"
        style={{
          display: 'inline-block',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <g>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 12a4 4 0 1 1 8 0" stroke="currentColor" strokeWidth="2"/>
          </g>
        </svg>
      </span>
      {flipped ? "일반인 프로필" : "개발자 프로필"}
    </button>
  );
}

function ProfileCardContent({
  profile,
  isDev,
  isAdmin,
  onProfileChange,
  onProfileIntroChange,
  onProfileRegionChange,
}: {
  profile: Profile;
  isDev: boolean;
  isAdmin?: boolean;
  onProfileChange?: (field: keyof Profile, value: string) => void;
  onProfileIntroChange?: (value: string) => void;
  onProfileRegionChange?: (value: string) => void;
}) {
  return (
    <div
      className="
        w-full
        bg-[#27272A] dark:bg-[#27272A]
        rounded-[20px] shadow-lg p-6 sm:p-8 flex flex-col items-center
        text-[#E4E4E7]
        dark:text-[#E4E4E7]
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
      {/* 관심사·취미 */}
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-semibold text-[#18181b] dark:text-[#E4E4E7] mb-2">
          {isDev ? "주요 기술" : "관심사·취미"}
        </div>
        {isAdmin && !isDev ? (
          <input
            type="text"
            className="w-full rounded bg-[#f4f4f4] dark:bg-[#232334] text-[#18181b] dark:text-white p-2 text-sm mb-2 border border-gray-300 dark:border-gray-600"
            value={profile.interests.join(', ')}
            onChange={e => onProfileChange?.('interests', e.target.value)}
            placeholder="관심사·취미 (쉼표로 구분)"
          />
        ) : null}
        <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-1">
          {profile.interests.map((tag, idx, arr) => (
            <span
              key={tag}
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
      {/* 자기소개 */}
      <div className="w-full text-center mb-6">
        <div className="text-[1rem] font-semibold text-[#18181b] dark:text-[#E4E4E7] mb-2">소개</div>
        {isAdmin && !isDev ? (
          <textarea
            className="w-full rounded bg-[#f4f4f4] dark:bg-[#232334] text-[#18181b] dark:text-white p-2 text-sm mb-2 border border-gray-300 dark:border-gray-600"
            rows={3}
            value={profile.intro.join('\n')}
            onChange={e => onProfileIntroChange?.(e.target.value)}
            placeholder="소개 (여러 줄 입력 가능)"
          />
        ) : null}
        <div className="space-y-3 text-[#232334] dark:text-[#C4C4C8] text-[1rem] leading-[1.5]">
          {profile.intro.map((p, i) => (
            <p key={i} className={i !== 0 ? "mt-3" : ""}>{p}</p>
          ))}
        </div>
      </div>
      {/* 위치 */}
      <div className="mt-4 text-[0.875rem] flex items-center justify-center text-[#6b7280] dark:text-[#B0B0B8] font-medium">
        <span className="mr-1" aria-hidden>📍</span>
        {isAdmin && !isDev ? (
          <input
            type="text"
            className="rounded bg-[#f4f4f4] dark:bg-[#232334] text-[#18181b] dark:text-white p-1 px-2 text-sm border border-gray-300 dark:border-gray-600"
            value={profile.region}
            onChange={e => onProfileRegionChange?.(e.target.value)}
            placeholder="거주 지역"
            style={{ minWidth: 120 }}
          />
        ) : (
          profile.region
        )}
      </div>
    </div>
  );
}
