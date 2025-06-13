import { useState, useEffect, useRef } from 'react';
import { Profile } from './profile.model';
import {
  fetchProfile,
  saveProfile,
  fetchDevProfile,
  saveDevProfile,
} from './profile.api';
import ProfileCardContent from './ProfileCardContent';
import ProfileEditForm from './ProfileEditForm';

export default function FlippableProfileCard({ isAdmin = false }: { isAdmin?: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devProfile, setDevProfile] = useState<Profile | null>(null);

  // 스와이프 상태
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    fetchProfile().then(setProfile);
    fetchDevProfile().then(setDevProfile);
  }, []);

  // 스와이프 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    if (Math.abs(dx) > 60) {
      setFlipped(dx < 0);
      dragging.current = false;
      startX.current = null;
    }
  };
  const handleTouchEnd = () => {
    dragging.current = false;
    startX.current = null;
  };

  // 마우스 드래그(데스크탑)
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    dragging.current = true;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current || startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 60) {
      setFlipped(dx < 0);
      dragging.current = false;
      startX.current = null;
    }
  };
  const handleMouseUp = () => {
    dragging.current = false;
    startX.current = null;
  };

  // 프로필 수정 핸들러
  const handleProfileChange = async (next: Profile) => {
    setProfile(next);
    await saveProfile(next);
  };
  const handleDevProfileChange = async (next: Profile) => {
    setDevProfile(next);
    await saveDevProfile(next);
  };

  return (
    <section
      className="max-w-[600px] mx-auto mt-20 mb-8 px-2 relative select-none"
      style={{ perspective: 1200, overflow: 'visible' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10 text-xs sm:text-sm font-semibold bg-[#232334] text-[#E4E4E7] px-4 py-1.5 rounded-full shadow pointer-events-none select-none">
        {flipped ? "개발자 프로필" : "일반인 프로필"}
      </div>
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
                {isAdmin && (
                  <ProfileEditForm
                    profile={profile}
                    onChange={handleProfileChange}
                    label="관심사·취미"
                  />
                )}
              </>
            )}
          </div>
          {/* 뒷면 */}
          <div className={`w-full h-full left-0 top-0 ${flipped ? 'relative' : 'absolute'}`} style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
            {devProfile && (
              <>
                <ProfileCardContent profile={devProfile} isDev />
                {isAdmin && (
                  <ProfileEditForm
                    profile={devProfile}
                    onChange={handleDevProfileChange}
                    label="주요 기술"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
