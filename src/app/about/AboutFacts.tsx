import type { Profile } from '@/features/profile/profile.model';

interface AboutFactsProps {
  profile: Profile;
}

const mutedStyle = { color: 'var(--muted)' } as const;

export default function AboutFacts({ profile }: AboutFactsProps): JSX.Element {
  const showWhy = profile.motivation || (profile.values && profile.values.length > 0) || profile.goal;
  return (
    <>
      {showWhy && <WhyWhatWhere profile={profile} />}
      <SummaryFacts profile={profile} />
    </>
  );
}

function WhyWhatWhere({ profile }: { profile: Profile }): JSX.Element {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-3">왜 / 무엇을 / 어디로</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm leading-[1.7]">
        {profile.motivation && (
          <>
            <dt style={mutedStyle}>왜</dt>
            <dd>{profile.motivation}</dd>
          </>
        )}
        {profile.values && profile.values.length > 0 && (
          <>
            <dt style={mutedStyle}>가치</dt>
            <dd>{profile.values.join(' · ')}</dd>
          </>
        )}
        {profile.goal && (
          <>
            <dt style={mutedStyle}>1~2년</dt>
            <dd>{profile.goal}</dd>
          </>
        )}
      </dl>
    </div>
  );
}

function SummaryFacts({ profile }: { profile: Profile }): JSX.Element {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-3">한 줄 요약</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm leading-[1.7]">
        <dt style={mutedStyle}>이름</dt>
        <dd>여준수 (한글) / Yeojunsu (영문)</dd>
        <dt style={mutedStyle}>다른 표기</dt>
        <dd>ヨ・ジュンス · 余俊秀</dd>
        <dt style={mutedStyle}>직업</dt>
        <dd>{profile.tagline}</dd>
        <dt style={mutedStyle}>학력</dt>
        <dd>광운대학교 소프트웨어학과 · 컴퓨터공학 전공 · 3학년 재학</dd>
        <dt style={mutedStyle}>국적</dt>
        <dd>대한민국</dd>
        <dt style={mutedStyle}>이메일</dt>
        <dd>
          <a className="underline underline-offset-4" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </dd>
        <dt style={mutedStyle}>공식 사이트</dt>
        <dd>
          <a className="underline underline-offset-4" href="https://yeojoonsoo02.com">
            yeojoonsoo02.com
          </a>
        </dd>
        <dt style={mutedStyle}>GitHub</dt>
        <dd>
          <a className="underline underline-offset-4" href="https://github.com/yeojoonsoo02">
            github.com/yeojoonsoo02
          </a>
        </dd>
      </dl>
    </div>
  );
}
