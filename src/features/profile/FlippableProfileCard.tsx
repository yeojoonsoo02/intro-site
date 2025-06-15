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

type Props = {
  isAdmin?: boolean;
  onAngleChange?: (angle: number) => void;
};

export default function FlippableProfileCard({ isAdmin = false, onAngleChange }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devProfile, setDevProfile] = useState<Profile | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const pointerHandlers = useCardFlip({ innerRef, onAngleChange });

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
      className="max-w-[600px] mx-auto mt-20 mb-8 px-2 relative select-none z-10"
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
          <div
            className="w-full h-full absolute top-0 left-0"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
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
            className="w-full h-full absolute top-0 left-0"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
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