import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';

interface SEOProfileProps {
  lang?: 'ko' | 'en' | 'ja' | 'zh';
}

const META = {
  ko: {
    siteName: '여준수 | 자기소개 사이트',
    headingPrefix: '여준수',
    headingSuffix: 'Yeo Joonsoo',
    subheading: '대학생 개발자의 자기소개 · 포트폴리오',
    descIntro: '대학생 개발자 여준수입니다. 프론트엔드 개발과 AI 연구에 관심이 많으며 개인 프로젝트를 통해 기술을 탐구합니다.',
    sectionsLabel: { interests: '관심사', region: '지역', contact: '연락' },
  },
  en: {
    siteName: 'Yeo Joonsoo | Personal Site',
    headingPrefix: 'Yeo Joonsoo',
    headingSuffix: '여준수',
    subheading: 'Student developer — Profile and portfolio',
    descIntro: "Hi, I'm Yeo Joonsoo (여준수), a student developer focused on frontend engineering and AI.",
    sectionsLabel: { interests: 'Interests', region: 'Region', contact: 'Contact' },
  },
  ja: {
    siteName: '여준수 | 自己紹介サイト',
    headingPrefix: '여준수',
    headingSuffix: 'ヨ・ジュンス',
    subheading: '大学生開発者の自己紹介・ポートフォリオ',
    descIntro: '大学生開発者の여준수（ヨ・ジュンス）です。フロントエンド開発とAI研究を楽しんでいます。',
    sectionsLabel: { interests: '興味', region: '地域', contact: '連絡先' },
  },
  zh: {
    siteName: '여준수 | 个人介绍网站',
    headingPrefix: '여준수',
    headingSuffix: '余俊秀',
    subheading: '大学生开发者的个人介绍与作品集',
    descIntro: '我是大学生开发者여준수（余俊秀），专注于前端开发与人工智能研究。',
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
      <p>{meta.subheading}</p>
      <p>{meta.descIntro}</p>
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

      <h2>{meta.sectionsLabel.region}</h2>
      <p>{profile.region}</p>

      <h2>{meta.sectionsLabel.contact}</h2>
      <p>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
    </section>
  );
}
