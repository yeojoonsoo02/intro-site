import type { Interest } from '@/features/profile/profile.model';
import { getLabels } from './labels';
import { AboutSectionTitle } from './SectionTitle';

interface AboutInterestsProps {
  interests: Interest[];
  lang: string;
}

export default function AboutInterests({ interests, lang }: AboutInterestsProps): JSX.Element {
  const t = getLabels(lang);
  return (
    <div>
      <AboutSectionTitle>{t('hobbiesInterests')}</AboutSectionTitle>
      <div className="flex flex-wrap gap-2">
        {interests.map((it) => {
          const label = typeof it === 'string' ? it : it.label;
          return (
            <span
              key={label}
              className="px-3 py-1 text-[0.9375rem]"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--ink-2)',
                borderRadius: 'var(--r-md)',
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
