'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Profile } from './profile.model';
import { fetchProfile } from './profile.api';
import { DEFAULT_PROFILES } from './defaultProfiles';
import ProfileCardContent from './ProfileCardContent';

export default function ProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language || 'ko';
    // 언어 변경 시 이전 요청의 stale 응답이 최신 상태를 덮어쓰지 않도록 cancelled 플래그 사용
    let cancelled = false;
    const fallback = DEFAULT_PROFILES[lang] ?? DEFAULT_PROFILES.en;
    // 실패해도 반드시 폴백을 세운다. Firestore에 닿지 못할 때(차단된 망, 광고 차단기, 장애)
    // profile이 null로 남으면 랜딩의 프로필 카드가 통째로 빈 화면이 된다.
    fetchProfile(lang)
      .then((p) => {
        if (!cancelled) setProfile(p ?? fallback);
      })
      .catch((err) => {
        console.error('Failed to load profile, using default:', err);
        if (!cancelled) setProfile(fallback);
      });
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  return (
    <section
      className="max-w-[600px] mx-auto mt-4 sm:mt-8 md:mt-10 mb-4 sm:mb-8 px-3 sm:px-4 z-10"
      // 프로필이 도착하기 전엔 카드가 비어 있어 첫 페인트 뒤 콘텐츠가 아래로 밀린다.
      // 뷰포트 기준으로 자리를 잡아두고, 실제 카드가 뜨면 해제된다.
      style={profile ? undefined : { minHeight: '55vh' }}
    >
      {profile && <ProfileCardContent profile={profile} />}
    </section>
  );
}
