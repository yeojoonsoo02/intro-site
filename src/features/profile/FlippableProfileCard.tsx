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

type Props = {
  isAdmin?: boolean;
  onAngleChange?: (angle: number) => void;
};

export default function FlippableProfileCard({ isAdmin = false, onAngleChange }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devProfile, setDevProfile] = useState<Profile | null>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const { isFlipped, ...pointerHandlers } = useCardFlip({
    innerRef,
    onAngleChange,
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

  // Adjust container height based on content of both faces
  useEffect(() => {
    const container = containerRef.current;
    const front = frontRef.current;
    const back = backRef.current;
    if (!container || !front || !back) return;

    const updateHeight = () => {
      const h = Math.max(front.offsetHeight, back.offsetHeight);
      container.style.height = `${h}px`;
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(front);
    ro.observe(back);
    return () => {
      ro.disconnect();
    };
  }, [profile, devProfile]);

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
      className="max-w-[600px] mx-auto mt-10 mb-8 px-2 relative select-none z-10"
      style={{ perspective: 1200, overflow: 'visible', touchAction: 'pan-y' }}
      {...pointerHandlers}
      ref={containerRef}
    >
      <div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
        ref={innerRef}
      >
        <div
          className="w-full"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
          ref={frontRef}
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
          className="w-full absolute top-0 left-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          ref={backRef}
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
    </section>
  );
}