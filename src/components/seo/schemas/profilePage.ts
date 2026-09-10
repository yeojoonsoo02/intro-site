import { SITE_CREATED, SITE_MODIFIED, SITE_URL } from './constants';
import { personEntity } from './person';
import { BCP47, langUrl, type Lang } from '@/lib/site';

export type ProfileLang = Lang;

// 언어별 name / description (현재 페이지 lang에 맞춰 분기)
const LOCALIZED_TEXT: Record<ProfileLang, { name: string; description: string }> = {
  ko: {
    name: '여준수 (Junsu Yeo) — 공식 프로필',
    description:
      '대학생 개발자 여준수(Junsu Yeo)의 공식 프로필 페이지. 자기소개와 연락처를 확인할 수 있습니다.',
  },
  en: {
    name: 'Junsu Yeo — Official Profile',
    description:
      "Official profile page of Junsu Yeo, a university student developer. Find his introduction and contact information.",
  },
  ja: {
    name: 'ヨ・ジュンス (Junsu Yeo) — 公式プロフィール',
    description:
      '大学生開発者ヨ・ジュンス(Junsu Yeo)の公式プロフィールページ。自己紹介と連絡先を確認できます。',
  },
  zh: {
    name: '呂晙壽 (Junsu Yeo) — 官方简介',
    description: '大学生开发者呂晙壽(Junsu Yeo)的官方简介页面。可查看自我介绍和联系方式。',
  },
  es: {
    name: 'Junsu Yeo — Perfil oficial',
    description:
      'Página de perfil oficial de Junsu Yeo, desarrollador y estudiante universitario. Consulta su presentación y datos de contacto.',
  },
  fr: {
    name: 'Junsu Yeo — Profil officiel',
    description:
      "Page de profil officielle de Junsu Yeo, développeur et étudiant universitaire. Découvrez sa présentation et ses coordonnées.",
  },
  de: {
    name: 'Junsu Yeo — Offizielles Profil',
    description:
      'Offizielle Profilseite von Junsu Yeo, einem studentischen Entwickler. Hier finden Sie seine Vorstellung und Kontaktdaten.',
  },
  pt: {
    name: 'Junsu Yeo — Perfil oficial',
    description:
      'Página de perfil oficial de Junsu Yeo, desenvolvedor e estudante universitário. Veja sua apresentação e informações de contato.',
  },
  ru: {
    name: 'Junsu Yeo — Официальный профиль',
    description:
      'Официальная страница профиля Junsu Yeo, студента-разработчика. Здесь можно найти его представление и контактные данные.',
  },
};

/**
 * 현재 페이지 언어(lang)에 맞춰 ProfilePage JSON-LD를 생성한다.
 * inLanguage / name / description을 lang별로 분기해 라우트별 언어 신호와 일치시킨다.
 */
export function buildProfilePageSchema(lang: ProfileLang) {
  const text = LOCALIZED_TEXT[lang];
  // 페이지 URL·@id를 해당 언어의 canonical로 분기 → inLanguage와 url 신호 일치.
  // (mainEntity #person 은 전역 단일 엔티티이므로 SITE_URL 기준 유지)
  const pageUrl = langUrl(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${pageUrl}#profilepage`,
    url: pageUrl,
    name: text.name,
    description: text.description,
    dateCreated: SITE_CREATED,
    dateModified: SITE_MODIFIED,
    inLanguage: BCP47[lang],
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
