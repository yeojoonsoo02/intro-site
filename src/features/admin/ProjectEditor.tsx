'use client';

import { useTranslation } from 'react-i18next';
import type { Project } from '@/features/portfolio/portfolio.model';

const inputStyle = {
  background: 'var(--input-bg)',
  color: 'var(--foreground)',
  border: '1px solid var(--input-border)',
};

type Props = {
  items: Project[];
  onChange: (items: Project[]) => void;
};

export default function ProjectEditor({ items, onChange }: Props) {
  const { t } = useTranslation();

  const addProject = () => {
    onChange([
      ...items,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        thumbnail: '',
        tags: [],
        liveUrl: '',
        repoUrl: '',
        featured: false,
        order: items.length,
      },
    ]);
  };

  const updateProject = (idx: number, patch: Partial<Project>) => {
    onChange(items.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const removeProject = (idx: number) => {
    if (!confirm(t('confirmDelete'))) return;
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {items.map((project, idx) => (
        <div
          key={project.id}
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'color-mix(in srgb, var(--foreground) 4%, transparent)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              #{idx + 1} {project.title || t('projectTitle')}
            </span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                <input
                  type="checkbox"
                  checked={project.featured}
                  onChange={(e) => updateProject(idx, { featured: e.target.checked })}
                />
                {t('featured')}
              </label>
              <button
                type="button"
                onClick={() => removeProject(idx)}
                className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-70"
                style={{ color: '#ef4444' }}
              >
                ✕
              </button>
            </div>
          </div>

          <input
            className="w-full rounded px-3 py-2 text-sm"
            style={inputStyle}
            value={project.title}
            onChange={(e) => updateProject(idx, { title: e.target.value })}
            placeholder={t('projectTitle')}
          />
          <textarea
            className="w-full rounded px-3 py-2 text-sm"
            style={inputStyle}
            rows={2}
            value={project.description}
            onChange={(e) => updateProject(idx, { description: e.target.value })}
            placeholder={t('projectDesc')}
          />
          <input
            className="w-full rounded px-3 py-2 text-sm"
            style={inputStyle}
            value={project.thumbnail}
            onChange={(e) => updateProject(idx, { thumbnail: e.target.value })}
            placeholder={t('thumbnailUrl')}
          />
          <input
            className="w-full rounded px-3 py-2 text-sm"
            style={inputStyle}
            value={project.tags.join(', ')}
            onChange={(e) => updateProject(idx, { tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            placeholder={t('tags')}
          />
          <div className="flex gap-2">
            <input
              className="flex-1 rounded px-3 py-2 text-sm"
              style={inputStyle}
              value={project.liveUrl ?? ''}
              onChange={(e) => updateProject(idx, { liveUrl: e.target.value })}
              placeholder={t('liveUrl')}
            />
            <input
              className="flex-1 rounded px-3 py-2 text-sm"
              style={inputStyle}
              value={project.repoUrl ?? ''}
              onChange={(e) => updateProject(idx, { repoUrl: e.target.value })}
              placeholder={t('repoUrl')}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addProject}
        className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
        style={{
          background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
          color: 'var(--primary)',
          border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
        }}
      >
        + {t('addProject')}
      </button>
    </div>
  );
}
