import { useState, useEffect } from 'react';
import { Profile } from './profile.model';
import { fetchProfile, saveProfile } from './profile.api';
import ProfileCardContent from './ProfileCardContent';
import ProfileEditForm from './ProfileEditForm';

export default function ProfileCard({ isAdmin = false }: { isAdmin?: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile().then(p => setProfile(p));
  }, []);

  const handleChange = async (next: Profile) => {
    setProfile(next);
    await saveProfile(next);
  };

  if (!profile) return <div className="text-center py-10 text-gray-400">로딩 중...</div>;

  return (
    <div>
      <ProfileCardContent profile={profile} isDev={false} />
      {isAdmin && (
        <ProfileEditForm profile={profile} onChange={handleChange} />
      )}
    </div>
  );
}
