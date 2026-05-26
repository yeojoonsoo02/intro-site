import type { Interest } from '@/features/profile/profile.model';

interface AboutInterestsProps {
  interests: Interest[];
}

export default function AboutInterests({ interests }: AboutInterestsProps): JSX.Element {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-3">요즘 빠져 있는 것들</h2>
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
