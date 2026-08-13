import type { Interest } from '@/features/profile/profile.model';
import { getLabels } from './labels';

interface AboutInterestsProps {
  interests: Interest[];
  lang: string;
}

export default function AboutInterests({ interests, lang }: AboutInterestsProps): JSX.Element {
  const t = getLabels(lang);
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-3">{t('hobbiesInterests')}</h2>
      <div className="flex flex-wrap gap-2">
        {interests.map((it) => {
          const label = typeof it === 'string' ? it : it.label;
          return (
            <span
              key={label}
              className="rounded-full px-3 py-1 text-[0.82rem] font-medium tracking-tight border"
              style={{
                background: 'color-mix(in srgb, var(--foreground) 8%, transparent)',
                color: 'color-mix(in srgb, var(--foreground) 75%, transparent)',
                borderColor: 'var(--border)',
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
