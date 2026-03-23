'use client';

import { useTranslation } from 'react-i18next';
import type { SkillCategory } from '@/features/portfolio/portfolio.model';

const inputStyle = {
  background: 'var(--input-bg)',
  color: 'var(--foreground)',
  border: '1px solid var(--input-border)',
};

type Props = {
  categories: SkillCategory[];
  onChange: (categories: SkillCategory[]) => void;
};

export default function SkillsEditor({ categories, onChange }: Props) {
  const { t } = useTranslation();

  const addCategory = () => {
    onChange([...categories, { id: Date.now().toString(), name: '', items: [] }]);
  };

  const updateCategory = (idx: number, name: string) => {
    onChange(categories.map((c, i) => (i === idx ? { ...c, name } : c)));
  };

  const removeCategory = (idx: number) => {
    if (!confirm(t('confirmDelete'))) return;
    onChange(categories.filter((_, i) => i !== idx));
  };

  const addSkill = (catIdx: number) => {
    onChange(
      categories.map((c, i) =>
        i === catIdx ? { ...c, items: [...c.items, { name: '', level: 3 }] } : c,
      ),
    );
  };

  const updateSkill = (catIdx: number, skillIdx: number, patch: { name?: string; level?: number }) => {
    onChange(
      categories.map((c, ci) =>
        ci === catIdx
          ? { ...c, items: c.items.map((s, si) => (si === skillIdx ? { ...s, ...patch } : s)) }
          : c,
      ),
    );
  };

  const removeSkill = (catIdx: number, skillIdx: number) => {
    onChange(
      categories.map((c, ci) =>
        ci === catIdx ? { ...c, items: c.items.filter((_, si) => si !== skillIdx) } : c,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {categories.map((cat, catIdx) => (
        <div
          key={cat.id}
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'color-mix(in srgb, var(--foreground) 4%, transparent)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded px-3 py-2 text-sm font-medium"
              style={inputStyle}
              value={cat.name}
              onChange={(e) => updateCategory(catIdx, e.target.value)}
              placeholder={t('categoryName')}
            />
            <button
              type="button"
              onClick={() => removeCategory(catIdx)}
              className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-70"
              style={{ color: '#ef4444' }}
            >
              ✕
            </button>
          </div>

          {cat.items.map((skill, skillIdx) => (
            <div key={skillIdx} className="flex items-center gap-2 pl-2">
              <input
                className="flex-1 rounded px-3 py-1.5 text-sm"
                style={inputStyle}
                value={skill.name}
                onChange={(e) => updateSkill(catIdx, skillIdx, { name: e.target.value })}
                placeholder={t('skillName')}
              />
              <select
                className="rounded px-2 py-1.5 text-sm"
                style={inputStyle}
                value={skill.level}
                onChange={(e) => updateSkill(catIdx, skillIdx, { level: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {'●'.repeat(n)}{'○'.repeat(5 - n)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeSkill(catIdx, skillIdx)}
                className="text-xs px-1 transition-opacity hover:opacity-70"
                style={{ color: '#ef4444' }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addSkill(catIdx)}
            className="text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-80"
            style={{ color: 'var(--primary)' }}
          >
            + {t('addSkill')}
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addCategory}
        className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
        style={{
          background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
          color: 'var(--primary)',
          border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        }}
      >
        + {t('addCategory')}
      </button>
    </div>
  );
}
