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
    headingSuffix: 'Yeojunsu',
    sectionsLabel: { interests: '관심사', contact: '연락' },
  },
  en: {
    siteName: 'Yeojunsu | Personal Site',
    headingPrefix: 'Yeojunsu',
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
    headingSuffix: '余俊秀',
    sectionsLabel: { interests: '兴趣', contact: '联系' },
  },
  es: {
    siteName: 'Yeojunsu | Sitio personal',
    headingPrefix: 'Yeojunsu',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Intereses', contact: 'Contacto' },
  },
  fr: {
    siteName: 'Yeojunsu | Site personnel',
    headingPrefix: 'Yeojunsu',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Intérêts', contact: 'Contact' },
  },
  de: {
    siteName: 'Yeojunsu | Persönliche Seite',
    headingPrefix: 'Yeojunsu',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Interessen', contact: 'Kontakt' },
  },
  pt: {
    siteName: 'Yeojunsu | Site pessoal',
    headingPrefix: 'Yeojunsu',
    headingSuffix: '여준수',
    sectionsLabel: { interests: 'Interesses', contact: 'Contato' },
  },
  ru: {
    siteName: 'Yeojunsu | Личный сайт',
    headingPrefix: 'Yeojunsu',
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
