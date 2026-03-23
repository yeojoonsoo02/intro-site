import { Profile } from './profile.model';
import { useTranslation } from 'react-i18next';

type Props = {
  profile: Profile;
  onChange: (profile: Profile) => void;
  label: string;
};

const inputStyle = {
  background: "var(--input-bg)",
  color: "var(--foreground)",
  border: "1px solid var(--input-border)",
};

export default function ProfileEditForm({ profile, onChange, label }: Props) {
  const { t } = useTranslation();
  const interests = profile.interests.map(item =>
    typeof item === 'string' ? { label: item, url: '' } : item,
  );

  const handleAdd = () => {
    if (interests.some(item => !item.label.trim() && !item.url.trim())) {
      return;
    }
    onChange({
      ...profile,
      interests: [...interests, { label: '', url: '' }],
    });
  };

  const handleRemove = (idx: number) => {
    const next = interests.filter((_, i) => i !== idx);
    onChange({ ...profile, interests: next });
  };

  const handleItemChange = (
    idx: number,
    key: 'label' | 'url',
    value: string,
  ) => {
    const next = interests.map((item, i) =>
      i === idx ? { ...item, [key]: value } : item,
    );
    onChange({ ...profile, interests: next });
  };

  const handleBlur = (idx: number) => {
    const next = interests.filter(
      (item, i) => !(i === idx && !item.label.trim() && !item.url.trim()),
    );
    if (next.length !== interests.length) {
      onChange({ ...profile, interests: next });
    }
  };

  return (
    <div className="w-full space-y-4 mt-4">
      {interests.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            className="flex-1 rounded p-2 text-sm"
            style={inputStyle}
            value={item.label}
            onChange={e => handleItemChange(idx, 'label', e.target.value)}
            placeholder={t(label)}
            onBlur={() => handleBlur(idx)}
          />
          <input
            className="flex-1 rounded p-2 text-sm"
            style={inputStyle}
            value={item.url}
            onChange={e => handleItemChange(idx, 'url', e.target.value)}
            placeholder={t('linkUrl', 'Link (URL)')}
            onBlur={() => handleBlur(idx)}
          />
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-70"
            style={{ color: "#ef4444" }}
            aria-label={t('deleteItem', 'Delete item')}
          >
            ❌
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="text-sm px-3 py-1 rounded transition-opacity hover:opacity-80"
        style={{
          background: "color-mix(in srgb, var(--foreground) 10%, transparent)",
          color: "var(--foreground)",
        }}
      >
        + {t('addItem', 'Add item')}
      </button>
      <textarea
        className="w-full rounded p-2 text-sm"
        style={inputStyle}
        rows={3}
        value={profile.intro.join('\n')}
        onChange={e => onChange({ ...profile, intro: e.target.value.split('\n').filter(Boolean) })}
        placeholder={t('introPlaceholder', 'Introduction (multiple lines allowed)')}
      />
      <input
        className="w-full rounded p-2 text-sm"
        style={inputStyle}
        value={profile.region}
        onChange={e => onChange({ ...profile, region: e.target.value })}
        placeholder={t('regionPlaceholder', 'Region')}
      />
    </div>
  );
}
