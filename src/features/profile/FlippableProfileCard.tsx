import { useState, useEffect } from 'react';
import { Profile } from './profile.model';
import { fetchProfile, saveProfile } from './profile.api';
import ProfileCardContent from './ProfileCardContent';
import ProfileEditForm from './ProfileEditForm';

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

export default function FlippableProfileCard({ isAdmin = false }: { isAdmin?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile().then(p => setProfile(p));
  }, []);

  const handleChange = async (next: Profile) => {
    setProfile(next);
    await saveProfile(next);
  };

  return (
    <section className="max-w-[600px] mx-auto mt-20 mb-8 px-2 relative" style={{ perspective: 1200, overflow: 'visible' }}>
      <button
        className="absolute top-3 right-3 z-10 bg-[#232334] text-[#E4E4E7] px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow hover:bg-[color:var(--primary)] hover:text-white transition flex items-center gap-1"
        style={{
          minWidth: 80,
          minHeight: 32,
          willChange: 'transform',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
        }}
        onClick={() => setFlipped(f => !f)}
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
            {profile && (
              <>
                <ProfileCardContent profile={profile} isDev={false} />
                {isAdmin && <ProfileEditForm profile={profile} onChange={handleChange} />}
              </>
            )}
          </div>
          {/* 뒷면 */}
          <div className={`w-full h-full left-0 top-0 ${flipped ? 'relative' : 'absolute'}`} style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
            <ProfileCardContent profile={defaultDevProfile} isDev />
          </div>
        </div>
      </div>
    </section>
  );
}
