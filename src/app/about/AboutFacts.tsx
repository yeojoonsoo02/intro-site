import type { Profile } from '@/features/profile/profile.model';
import { getFactLabels } from './factLabels';

interface AboutFactsProps {
  profile: Profile;
  lang: string;
  education: string;
  /** Firestore의 가치관·목표를 따로 보여주면 여기서는 중복이라 '왜'만 남긴다. */
  proseShownElsewhere: boolean;
}

const mutedStyle = { color: 'var(--muted)' } as const;

export default function AboutFacts({
  profile,
  lang,
  education,
  proseShownElsewhere,
}: AboutFactsProps): JSX.Element {
  const L = getFactLabels(lang);
  const showValues = !proseShownElsewhere && profile.values && profile.values.length > 0;
  const showGoal = !proseShownElsewhere && Boolean(profile.goal);
  const showWhy = Boolean(profile.motivation) || showValues || showGoal;

  return (
    <>
      {showWhy && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3">{L.whyHeading}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm leading-[1.7]">
            {profile.motivation && (
              <div className="contents">
                <dt style={mutedStyle}>{L.why}</dt>
                <dd>{profile.motivation}</dd>
              </div>
            )}
            {showValues && (
              <div className="contents">
                <dt style={mutedStyle}>{L.values}</dt>
                <dd>{profile.values!.join(' · ')}</dd>
              </div>
            )}
            {showGoal && (
              <div className="contents">
                <dt style={mutedStyle}>{L.goal}</dt>
                <dd>{profile.goal}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">{L.summaryHeading}</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm leading-[1.7]">
          <div className="contents">
            <dt style={mutedStyle}>{L.name}</dt>
            <dd>여준수 · Yeojunsu</dd>
          </div>
          <div className="contents">
            <dt style={mutedStyle}>{L.alsoWritten}</dt>
            <dd>ヨ・ジュンス · 呂晙壽</dd>
          </div>
          {L.clan && (
            <div className="contents">
              <dt style={mutedStyle}>{L.clan}</dt>
              <dd>함양(咸陽) 여씨</dd>
            </div>
          )}
          <div className="contents">
            <dt style={mutedStyle}>{L.occupation}</dt>
            <dd>{profile.tagline}</dd>
          </div>
          {education && (
            <div className="contents">
              <dt style={mutedStyle}>{L.education}</dt>
              <dd>{education}</dd>
            </div>
          )}
          <div className="contents">
            <dt style={mutedStyle}>{L.nationality}</dt>
            <dd>{L.nationalityValue}</dd>
          </div>
          <div className="contents">
            <dt style={mutedStyle}>{L.email}</dt>
            <dd>
              <a className="underline underline-offset-4" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </dd>
          </div>
          <div className="contents">
            <dt style={mutedStyle}>{L.website}</dt>
            <dd>
              <a className="underline underline-offset-4" href="https://yeojoonsoo02.com">
                yeojoonsoo02.com
              </a>
            </dd>
          </div>
          <div className="contents">
            <dt style={mutedStyle}>GitHub</dt>
            <dd>
              <a className="underline underline-offset-4" href="https://github.com/yeojoonsoo02">
                github.com/yeojoonsoo02
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
