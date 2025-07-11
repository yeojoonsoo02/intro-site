import type { Profile } from './profile.model';

export const DEFAULT_PROFILES: Record<string, Profile> = {
  en: {
    name: 'Junsu Yeo',
    tagline: 'Student Developer',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['Frontend development', 'AI research', 'Music', 'Travel'],
    intro: [
      "Hi, I'm Junsu, a college student and developer.",
      'In my free time I enjoy exploring new technologies and working on personal projects.',
    ],
    region: 'Incheon, South Korea',
  },
  ko: {
    name: '여준수',
    tagline: '대학생 개발자',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['프론트엔드 개발', 'AI 연구', '음악', '여행'],
    intro: [
      '안녕하세요, 저는 대학생 개발자 준수입니다.',
      '여가 시간에는 새로운 기술을 탐구하고 개인 프로젝트를 진행하는 것을 좋아합니다.',
    ],
    region: '인천, 대한민국',
  },
  ja: {
    name: 'Junsu',
    tagline: '大学生の開発者',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['フロントエンド開発', 'AI研究', '音楽', '旅行'],
    intro: [
      'こんにちは、大学生兼開発者のJunsuです。',
      '空いた時間には新しい技術を学び、個人プロジェクトに取り組んでいます。',
    ],
    region: '韓国 仁川',
  },
  zh: {
    name: 'Junsu',
    tagline: '大学生开发者',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['前端开发', '人工智能研究', '音乐', '旅行'],
    intro: [
      '大家好，我是大学生开发者Junsu。',
      '空闲时喜欢探索新技术并制作个人项目。',
    ],
    region: '韩国仁川',
  },
};
