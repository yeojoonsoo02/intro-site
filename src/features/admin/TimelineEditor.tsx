'use client';

import { useTranslation } from 'react-i18next';
import type { TimelineItem } from '@/features/portfolio/portfolio.model';

const inputStyle = {
  background: 'var(--input-bg)',
  color: 'var(--foreground)',
  border: '1px solid var(--input-border)',
};

type Props = {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
};

export default function TimelineEditor({ items, onChange }: Props) {
  const { t } = useTranslation();

  const addItem = () => {
    onChange([
      ...items,
      {
        id: Date.now().toString(),
        year: '',
        title: '',
        description: '',
        type: 'etc',
        order: items.length,
      },
    ]);
  };

  const update = (idx: number, patch: Partial<TimelineItem>) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const remove = (idx: number) => {
    if (!confirm(t('confirmDelete'))) return;
    onChange(items.filter((_, i) => i !== idx));
  };

  const typeOptions: TimelineItem['type'][] = ['work', 'education', 'project', 'etc'];

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'color-mix(in srgb, var(--foreground) 4%, transparent)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {item.title || t('timelineTitle')}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-70"
              style={{ color: '#ef4444' }}
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2">
            <input
              className="w-28 rounded px-3 py-2 text-sm"
              style={inputStyle}
              value={item.year}
              onChange={(e) => update(idx, { year: e.target.value })}
              placeholder={t('year')}
            />
            <select
              className="rounded px-2 py-2 text-sm"
              style={inputStyle}
              value={item.type}
              onChange={(e) => update(idx, { type: e.target.value as TimelineItem['type'] })}
            >
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {t(opt)}
                </option>
              ))}
            </select>
          </div>

          <input
            className="w-full rounded px-3 py-2 text-sm"
            style={inputStyle}
            value={item.title}
            onChange={(e) => update(idx, { title: e.target.value })}
            placeholder={t('timelineTitle')}
          />
          <textarea
            className="w-full rounded px-3 py-2 text-sm"
            style={inputStyle}
            rows={2}
            value={item.description}
            onChange={(e) => update(idx, { description: e.target.value })}
            placeholder={t('timelineDesc')}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
        style={{
          background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
          color: 'var(--primary)',
          border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        }}
      >
        + {t('addTimeline')}
      </button>
    </div>
  );
}
