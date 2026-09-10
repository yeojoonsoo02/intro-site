import { DEFAULT_PROFILES } from '@/features/profile/defaultProfiles';

type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'es' | 'fr' | 'de' | 'pt' | 'ru';

interface SEOProfileProps {
  lang?: Lang;
}

const META: Record<Lang, {
  siteName: string;
  headingPrefix: string;
  headingSuffix: string;
  sectionsLabel: { interests: string; contact: string };
}> = {
  ko: {
    siteName: '여준수 | 자기소개 사이트',
    headingPrefix: '여준수',
    headingSuffix: 'Junsu Yeo',
    sectionsLabel: { interests: '관심사', contact: '연락' },
  },
  en: {
    siteName: 'Junsu Yeo | Personal Site',
    headingPrefix: 'Junsu Yeo',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Interests', contact: 'Contact' },
  },
  ja: {
    siteName: '여준수 | 自己紹介サイト',
    headingPrefix: '여준수',
    headingSuffix: 'ヨ・ジュンス',
    sectionsLabel: { interests: '興味', contact: '連絡先' },
  },
  zh: {
    siteName: '여준수 | 个人介绍网站',
    headingPrefix: '여준수',
    headingSuffix: '呂晙壽',
    sectionsLabel: { interests: '兴趣', contact: '联系' },
  },
  es: {
    siteName: 'Junsu Yeo | Sitio personal',
    headingPrefix: 'Junsu Yeo',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Intereses', contact: 'Contacto' },
  },
  fr: {
    siteName: 'Junsu Yeo | Site personnel',
    headingPrefix: 'Junsu Yeo',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Intérêts', contact: 'Contact' },
  },
  de: {
    siteName: 'Junsu Yeo | Persönliche Seite',
    headingPrefix: 'Junsu Yeo',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Interessen', contact: 'Kontakt' },
  },
  pt: {
    siteName: 'Junsu Yeo | Site pessoal',
    headingPrefix: 'Junsu Yeo',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Interesses', contact: 'Contato' },
  },
  ru: {
    siteName: 'Junsu Yeo | Личный сайт',
    headingPrefix: 'Junsu Yeo',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Интересы', contact: 'Контакты' },
  },
};

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
      {/* sr-only SEO 영역 — Next/Image 최적화 불필요 (실제 LCP 이미지는 별도). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/profile.jpg"
        alt="여준수 (Junsu Yeo) 대학생 개발자 프로필 사진"
        width={800}
        height={800}
        loading="eager"
        fetchPriority="high"
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
