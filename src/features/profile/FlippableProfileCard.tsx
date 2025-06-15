'use client';

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
import useCardFlip from './useCardFlip';
import AuthButton from '../auth/AuthButton'; // ✅ 설정 버튼 import

export default function FlippableProfileCard({ isAdmin = false }: { isAdmin?: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devProfile, setDevProfile] = useState<Profile | null>(null);
  const [angle, setAngle] = useState(0); // ✅ 현재 회전 각도 저장
  const innerRef = useRef<HTMLDivElement>(null);

  const pointerHandlers = useCardFlip({
    innerRef,
    onAngleChange: setAngle, // ✅ 각도 업데이트 콜백 전달
  });

  useEffect(() => {
    fetchProfile().then(setProfile);
    fetchDevProfile().then(setDevProfile);

    if (innerRef.current) {
      innerRef.current.animate(
        [
          { transform: 'rotateY(0deg)' },
          { transform: 'rotateY(15deg)' },
          { transform: 'rotateY(0deg)' },
        ],
        { duration: 800, easing: 'ease-in-out', delay: 500 }
      );
    }
  }, []);

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
      style={{ perspective: 1200, overflow: 'visible', touchAction: 'pan-y' }}
      {...pointerHandlers}
    >
      {/* ✅ 1000도 이상일 때만 설정 버튼 표시 */}
      {angle >= 1000 && (
        <AuthButton />
      )}

      <div className="relative w-full min-h-[480px]" style={{ perspective: 1200, overflow: 'visible' }}>
        <div
          ref={innerRef}
          className="w-full h-full"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          <div
            className={`w-full h-full left-0 top-0 absolute`}
            style={{ backfaceVisibility: 'hidden' }}
          >
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

          <div
            className={`w-full h-full left-0 top-0 absolute`}
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          >
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