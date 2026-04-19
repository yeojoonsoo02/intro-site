import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';

interface SEOProfileProps {
  lang?: 'ko' | 'en' | 'ja' | 'zh';
}

const META = {
  ko: {
    siteName: '여준수 | 자기소개 사이트',
    headingPrefix: '여준수',
    headingSuffix: 'Yeojunsu',
    sectionsLabel: { interests: '관심사', region: '지역', contact: '연락' },
  },
  en: {
    siteName: 'Yeojunsu | Personal Site',
    headingPrefix: 'Yeojunsu',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Interests', region: 'Region', contact: 'Contact' },
  },
  ja: {
    siteName: '여준수 | 自己紹介サイト',
    headingPrefix: '여준수',
    headingSuffix: 'ヨ・ジュンス',
    sectionsLabel: { interests: '興味', region: '地域', contact: '連絡先' },
  },
  zh: {
    siteName: '여준수 | 个人介绍网站',
    headingPrefix: '여준수',
    headingSuffix: '余俊秀',
    sectionsLabel: { interests: '兴趣', region: '地区', contact: '联系' },
  },
} as const;

export default function SEOProfile({ lang = 'ko' }: SEOProfileProps) {
  const profile = DEFAULT_PROFILES[lang] ?? DEFAULT_PROFILES.ko;
  const meta = META[lang];

  return (
    <section
      aria-label={meta.siteName}
      className="sr-only"
    >
      <h1>
        {meta.headingPrefix} ({meta.headingSuffix}) — {profile.tagline}
      </h1>
      <img
        src="/profile.jpg"
        alt="여준수 (Yeojunsu) 대학생 개발자 프로필 사진"
        width={800}
        height={800}
        loading="eager"
        // @ts-expect-error fetchPriority는 React 타입에 아직 없지만 HTML 표준이라 동작함
        fetchpriority="high"
      />
      {profile.intro?.map((line, i) => (
        <p key={i}>{line}</p>
      ))}

      <h2>{meta.sectionsLabel.interests}</h2>
      <ul>
        {profile.interests?.map((item) => {
          const label = typeof item === 'string' ? item : item.label;
          return <li key={label}>{label}</li>;
        })}
      </ul>

      <h2>{meta.sectionsLabel.contact}</h2>
      <p>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
    </section>
  );
}
