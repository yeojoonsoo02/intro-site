// FlippableProfileCard.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Profile } from './profile.model';
import {
  fetchProfile,
  saveProfile,
  fetchDevProfile,
  saveDevProfile,
} from './profile.api';
import { DEFAULT_PROFILES } from './defaultProfiles';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import ProfileCardContent from './ProfileCardContent';
import useCardFlip from './useCardFlip';

const ProfileEditForm = dynamic(() => import('./ProfileEditForm'), {
  ssr: false,
});

type Props = {
  isAdmin?: boolean;
  onAngleChange?: (angle: number) => void;
};

export default function FlippableProfileCard({ isAdmin = false, onAngleChange }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devProfile, setDevProfile] = useState<Profile | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const { i18n, t } = useTranslation();
  const innerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const { isFlipped: _isFlipped, ...pointerHandlers } = useCardFlip({
    innerRef,
    onAngleChange: (angle: number) => {
      onAngleChange?.(angle);
      if (hintVisible && angle > 10) setHintVisible(false);
    },
  });

  useEffect(() => {
    // Fetch language-specific profiles
    const currentLang = i18n.language || 'en';
    fetchProfile(currentLang).then(p => setProfile(p ?? DEFAULT_PROFILES[currentLang] ?? DEFAULT_PROFILES['en']));
    fetchDevProfile(currentLang).then(p => setDevProfile(p ?? DEFAULT_PROFILES[currentLang] ?? DEFAULT_PROFILES['en']));

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
  }, [i18n.language]);

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

  const handleProfileChange = useCallback(async (next: Profile) => {
    setProfile(next);
    const currentLang = i18n.language || 'en';
    await saveProfile(next, currentLang);
  }, [i18n.language]);

  const handleDevProfileChange = useCallback(async (next: Profile) => {
    setDevProfile(next);
    const currentLang = i18n.language || 'en';
    await saveDevProfile(next, currentLang);
  }, [i18n.language]);

  return (
    <section
      className="max-w-[600px] mx-auto mt-6 sm:mt-8 md:mt-10 mb-6 sm:mb-8 px-3 sm:px-4 relative select-none z-10"
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
                  label="hobbies"
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
                  label="mainSkills"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* 스와이프 힌트 */}
      {hintVisible && (
        <p
          className="text-center text-[0.75rem] mt-4 animate-pulse select-none"
          style={{ color: "var(--muted)", opacity: 0.6 }}
        >
          {t('swipeHint')}
        </p>
      )}
    </section>
  );
}