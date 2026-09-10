import type { Profile } from '@/features/profile/profile.model';
import { getFactLabels } from './factLabels';
import { AboutSectionTitle } from './SectionTitle';

// '왜'와 '한 줄 요약'은 페이지에서 서로 떨어진 자리에 놓이므로 컴포넌트를 나눈다.
// (요약을 맨 위로 올리고, 동기·가치관·목표는 그 아래 묶음으로 내렸다.)


const DL_CLASS =
  'grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 sm:gap-y-2 text-base leading-[1.7]';

interface WhyProps {
  profile: Profile;
  lang: string;
  /** Firestore의 가치관·목표를 따로 보여주면 여기서는 중복이라 '왜'만 남긴다. */
  proseShownElsewhere: boolean;
}

export function AboutWhy({ profile, lang, proseShownElsewhere }: WhyProps): JSX.Element | null {
  const L = getFactLabels(lang);
  const showValues = !proseShownElsewhere && Boolean(profile.values?.length);
  const showGoal = !proseShownElsewhere && Boolean(profile.goal);
  if (!profile.motivation && !showValues && !showGoal) return null;

  return (
    <div>
      <AboutSectionTitle>{L.whyHeading}</AboutSectionTitle>
      <dl className={DL_CLASS}>
        {profile.motivation && (
          <div className="contents">
            <dt className="meta sm:pt-[3px]">{L.why}</dt>
            <dd>{profile.motivation}</dd>
          </div>
        )}
        {showValues && (
          <div className="contents">
            <dt className="meta sm:pt-[3px]">{L.values}</dt>
            <dd>{profile.values!.join(' · ')}</dd>
          </div>
        )}
        {showGoal && (
          <div className="contents">
            <dt className="meta sm:pt-[3px]">{L.goal}</dt>
            <dd>{profile.goal}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

interface SummaryProps {
  profile: Profile;
  lang: string;
  education: string;
}

export function AboutSummary({ profile, lang, education }: SummaryProps): JSX.Element {
  const L = getFactLabels(lang);
  return (
    <div>
      <AboutSectionTitle>{L.summaryHeading}</AboutSectionTitle>
      <dl className={DL_CLASS}>
        <div className="contents">
          <dt className="meta sm:pt-[3px]">{L.name}</dt>
          <dd>여준수 · Junsu Yeo</dd>
        </div>
        <div className="contents">
          <dt className="meta sm:pt-[3px]">{L.alsoWritten}</dt>
          <dd>ヨ・ジュンス · 呂晙壽</dd>
        </div>
        {L.clan && (
          <div className="contents">
            <dt className="meta sm:pt-[3px]">{L.clan}</dt>
            <dd>함양(咸陽) 여씨</dd>
          </div>
        )}
        <div className="contents">
          <dt className="meta sm:pt-[3px]">{L.occupation}</dt>
          <dd>{profile.tagline}</dd>
        </div>
        {education && (
          <div className="contents">
            <dt className="meta sm:pt-[3px]">{L.education}</dt>
            <dd>{education}</dd>
          </div>
        )}
        <div className="contents">
          <dt className="meta sm:pt-[3px]">{L.nationality}</dt>
          <dd>{L.nationalityValue}</dd>
        </div>
        <div className="contents">
          <dt className="meta sm:pt-[3px]">{L.email}</dt>
          <dd className="overflow-wrap-anywhere">
            <a className="link-u" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </dd>
        </div>
        <div className="contents">
          <dt className="meta sm:pt-[3px]">{L.website}</dt>
          <dd className="overflow-wrap-anywhere">
            <a className="link-u" href="https://yeojoonsoo02.com">
              yeojoonsoo02.com
            </a>
          </dd>
        </div>
        <div className="contents">
          <dt className="meta sm:pt-[3px]">GitHub</dt>
          <dd className="overflow-wrap-anywhere">
            <a className="link-u" href="https://github.com/yeojoonsoo02">
              github.com/yeojoonsoo02
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
