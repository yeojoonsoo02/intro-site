import { Profile } from './profile.model';

type Props = {
  profile: Profile;
  onChange: (profile: Profile) => void;
  label: string;
};

export default function ProfileEditForm({ profile, onChange, label }: Props) {
  return (
    <div className="w-full space-y-4 mt-4">
      <input
        className="w-full rounded bg-[#f4f4f4] dark:bg-[#232334] text-[#18181b] dark:text-white p-2 text-sm border border-gray-300 dark:border-gray-600"
        value={profile.interests.join(' ')}
        onChange={e =>
          onChange({
            ...profile,
            interests: e.target.value.split(' ').map(v => v.trim()).filter(Boolean),
          })
        }
        placeholder={`${label} (띄어쓰기로 구분)`}
      />
      <textarea
        className="w-full rounded bg-[#f4f4f4] dark:bg-[#232334] text-[#18181b] dark:text-white p-2 text-sm border border-gray-300 dark:border-gray-600"
        rows={3}
        value={profile.intro.join('\n')}
        onChange={e => onChange({ ...profile, intro: e.target.value.split('\n').filter(Boolean) })}
        placeholder="소개 (여러 줄 입력 가능)"
      />
      <input
        className="w-full rounded bg-[#f4f4f4] dark:bg-[#232334] text-[#18181b] dark:text-white p-2 text-sm border border-gray-300 dark:border-gray-600"
        value={profile.region}
        onChange={e => onChange({ ...profile, region: e.target.value })}
        placeholder="거주 지역"
      />
    </div>
  );
}
