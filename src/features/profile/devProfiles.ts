import type { Profile } from './profile.model';

// 홈 카드 뒷면 — 챗코가 개발자 프로필.
// Firestore profiles/dev_*는 2026-09-10 정리 때 삭제돼, 삭제 전 마이그레이션 스크립트
// (scripts/migrate-accurate.mjs, e739786)에 남아 있던 값을 그대로 코드에 둔다.
// 데이터가 있는 언어는 ko·en·ja·zh뿐이고 나머지는 영어로 채운다.
export const DEV_PROFILES: Record<string, Profile> = {
  ko: {
    name: '챗코가',
    tagline: 'AI 전문가 & 사업가',
    email: 'chatgptkrguide@gmail.com',
    photo: '/profile.jpg',
    interests: [
      { label: 'SNS 마케팅', url: '' },
      { label: '블로그 자동화', url: '' },
      { label: 'AI API 활용', url: '' },
    ],
    intro: [
      'AI 활용 콘텐츠 제작자이자 소프트웨어 개발자입니다.',
      'GPT와 같은 생성형 AI를 누구나 쉽게 활용할 수 있도록 돕는 콘텐츠를 만들고 있습니다',
      '현재는 GPT API 활용 프로젝트를 진행 중입니다.',
      'AI 활용이나 자동화에 관심 있다면 연락 주세요',
    ],
    region: '경기도 김포시 운양동',
  },
  en: {
    name: 'ChatKorea',
    tagline: 'AI Expert & Entrepreneur',
    email: 'chatgptkrguide@gmail.com',
    photo: '/profile.jpg',
    interests: [
      { label: 'SNS Marketing', url: '' },
      { label: 'Blog Automation', url: '' },
      { label: 'AI API Utilization', url: '' },
    ],
    intro: [
      'I am an AI content creator and software developer.',
      'I create content to help everyone easily utilize generative AI like GPT.',
      'Currently working on projects utilizing GPT API.',
      "Contact me if you're interested in AI utilization or automation.",
    ],
    region: 'Unyang-dong, Gimpo-si, Gyeonggi-do',
  },
  ja: {
    name: 'チャットコリア',
    tagline: 'AI専門家 & 起業家',
    email: 'chatgptkrguide@gmail.com',
    photo: '/profile.jpg',
    interests: [
      { label: 'SNSマーケティング', url: '' },
      { label: 'ブログ自動化', url: '' },
      { label: 'AI API活用', url: '' },
    ],
    intro: [
      'AI活用コンテンツクリエイター兼ソフトウェア開発者です。',
      'GPTのような生成AIを誰でも簡単に活用できるようにサポートするコンテンツを作っています。',
      '現在はGPT API活用プロジェクトを進めています。',
      'AI活用や自動化に興味がある方はお問い合わせください。',
    ],
    region: '京畿道金浦市雲陽洞',
  },
  zh: {
    name: '聊天韩国',
    tagline: 'AI专家 & 企业家',
    email: 'chatgptkrguide@gmail.com',
    photo: '/profile.jpg',
    interests: [
      { label: 'SNS营销', url: '' },
      { label: '博客自动化', url: '' },
      { label: 'AI API应用', url: '' },
    ],
    intro: [
      '我是AI内容创作者兼软件开发者。',
      '我创建内容帮助大家轻松使用像GPT这样的生成式AI。',
      '目前正在进行GPT API应用项目。',
      '如果您对AI应用或自动化感兴趣，请联系我。',
    ],
    region: '京畿道金浦市云阳洞',
  },
};

export function devProfileFor(lang: string): Profile {
  return DEV_PROFILES[lang] ?? DEV_PROFILES.en;
}
