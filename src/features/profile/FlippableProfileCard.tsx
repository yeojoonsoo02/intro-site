// FlippableProfileCard.tsx
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
import SocialLinks from '@/features/social/SocialLinks';

type Props = {
  isAdmin?: boolean;
  onAngleChange?: (angle: number) => void;
};

export default function FlippableProfileCard({ isAdmin = false, onAngleChange }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devProfile, setDevProfile] = useState<Profile | null>(null);
  const [angle, setAngle] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);

  // useCardFlip에 angle 업데이트 함수 전달
  const pointerHandlers = useCardFlip({ innerRef, onAngleChange: (a) => {
    setAngle(a);
    if (onAngleChange) onAngleChange(a);
  }});

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
          {/* 앞면 */}
          <div
            className="w-full"
            style={{
              backfaceVisibility: 'hidden',
              position: 'relative',
              zIndex: 2,
              transform: 'rotateY(0deg)',
              marginBottom: '2.5rem',
            }}
          >
            {profile && (
              <>
                <ProfileCardContent profile={profile} isDev={false} />
                <SocialLinks angle={angle} />
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
          <div
            className="w-full"
            style={{
              backfaceVisibility: 'hidden',
              position: 'relative',
              zIndex: 1,
              transform: 'rotateY(180deg)',
            }}
          >
            {devProfile && (
              <>
                <ProfileCardContent profile={devProfile} isDev />
                <SocialLinks angle={angle} />
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