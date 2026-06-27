import { SITE_CREATED, SITE_MODIFIED, SITE_URL } from './constants';
import { personEntity } from './person';

export type ProfileLang =
  | 'ko'
  | 'en'
  | 'ja'
  | 'zh'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'ru';

// 언어별 BCP-47 태그 (inLanguage용)
const IN_LANGUAGE: Record<ProfileLang, string> = {
  ko: 'ko-KR',
  en: 'en',
  ja: 'ja-JP',
  zh: 'zh-CN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  ru: 'ru-RU',
};

// 언어별 name / description (현재 페이지 lang에 맞춰 분기)
const LOCALIZED_TEXT: Record<ProfileLang, { name: string; description: string }> = {
  ko: {
    name: '여준수 (Yeojunsu) — 공식 프로필',
    description:
      '대학생 개발자 여준수(Yeojunsu)의 공식 프로필 페이지. 자기소개와 연락처를 확인할 수 있습니다.',
  },
  en: {
    name: 'Yeojunsu — Official Profile',
    description:
      "Official profile page of Yeojunsu, a university student developer. Find his introduction and contact information.",
  },
  ja: {
    name: 'ヨ・ジュンス (Yeojunsu) — 公式プロフィール',
    description:
      '大学生開発者ヨ・ジュンス(Yeojunsu)の公式プロフィールページ。自己紹介と連絡先を確認できます。',
  },
  zh: {
    name: '余俊秀 (Yeojunsu) — 官方简介',
    description: '大学生开发者余俊秀(Yeojunsu)的官方简介页面。可查看自我介绍和联系方式。',
  },
  es: {
    name: 'Yeojunsu — Perfil oficial',
    description:
      'Página de perfil oficial de Yeojunsu, desarrollador y estudiante universitario. Consulta su presentación y datos de contacto.',
  },
  fr: {
    name: 'Yeojunsu — Profil officiel',
    description:
      "Page de profil officielle de Yeojunsu, développeur et étudiant universitaire. Découvrez sa présentation et ses coordonnées.",
  },
  de: {
    name: 'Yeojunsu — Offizielles Profil',
    description:
      'Offizielle Profilseite von Yeojunsu, einem studentischen Entwickler. Hier finden Sie seine Vorstellung und Kontaktdaten.',
  },
  pt: {
    name: 'Yeojunsu — Perfil oficial',
    description:
      'Página de perfil oficial de Yeojunsu, desenvolvedor e estudante universitário. Veja sua apresentação e informações de contato.',
  },
  ru: {
    name: 'Yeojunsu — Официальный профиль',
    description:
      'Официальная страница профиля Yeojunsu, студента-разработчика. Здесь можно найти его представление и контактные данные.',
  },
};

/**
 * 현재 페이지 언어(lang)에 맞춰 ProfilePage JSON-LD를 생성한다.
 * inLanguage / name / description을 lang별로 분기해 라우트별 언어 신호와 일치시킨다.
 */
export function buildProfilePageSchema(lang: ProfileLang) {
  const text = LOCALIZED_TEXT[lang];
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE_URL}#profilepage`,
    url: SITE_URL,
    name: text.name,
    description: text.description,
    dateCreated: SITE_CREATED,
    dateModified: SITE_MODIFIED,
    inLanguage: IN_LANGUAGE[lang],
    mainEntity: personEntity,
    about: personEntity,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.sr-only p'],
    },
    hasPart: [
      { '@type': 'WebPage', '@id': `${SITE_URL}/about`, name: '공식 소개', url: `${SITE_URL}/about` },
      { '@type': 'WebPage', '@id': `${SITE_URL}/journey`, name: '여정', url: `${SITE_URL}/journey` },
      { '@type': 'WebPage', '@id': `${SITE_URL}/portfolio`, name: '포트폴리오', url: `${SITE_URL}/portfolio` },
    ],
  };
}
