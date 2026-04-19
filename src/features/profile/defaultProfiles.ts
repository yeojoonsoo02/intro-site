import type { Profile } from './profile.model';

// Language-specific default profiles with translated content
export const DEFAULT_PROFILES: Record<string, Profile> = {
  en: {
    name: 'Yeojunsu',
    tagline: 'Student Developer',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['Frontend development', 'AI research', 'Music', 'Travel'],
    intro: [
      "Hi, I'm Junsu, a college student and developer.",
      'In my free time I enjoy exploring new technologies and working on personal projects.',
    ],
    region: 'Nowon-gu Wolgyedong, Seoul, South Korea',
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
    region: '서울 노원구 월계동',
  },
  ja: {
    name: '여준수 (ヨ・ジュンス)',
    tagline: '大学生開発者',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['フロントエンド開発', 'AI研究', '音楽', '旅行'],
    intro: [
      'こんにちは、私は大学生開発者のジュンスです。',
      '余暇には新しい技術を探求し、個人プロジェクトに取り組むことを楽しんでいます。',
    ],
    region: 'ソウル蘆原区月渓洞, 韓国',
  },
  zh: {
    name: '余俊秀',
    tagline: '大学生开发者',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['前端开发', '人工智能研究', '音乐', '旅行'],
    intro: [
      '你好，我是大学生开发者俊秀。',
      '在空闲时间，我喜欢探索新技术并从事个人项目。',
    ],
    region: '首尔芦原区月桂洞，韩国',
  },
  es: {
    name: 'Yeojunsu (여준수)',
    tagline: 'Estudiante desarrollador',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['Desarrollo Frontend', 'Investigación en IA', 'Música', 'Viajes'],
    intro: [
      'Hola, soy Junsu, un estudiante desarrollador.',
      'En mi tiempo libre disfruto explorando nuevas tecnologías y trabajando en proyectos personales.',
    ],
    region: 'Seúl, Corea del Sur',
  },
  fr: {
    name: 'Yeojunsu (여준수)',
    tagline: 'Étudiant développeur',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['Développement Frontend', 'Recherche en IA', 'Musique', 'Voyage'],
    intro: [
      "Bonjour, je suis Junsu, étudiant développeur.",
      "Pendant mon temps libre, j'aime explorer de nouvelles technologies et travailler sur des projets personnels.",
    ],
    region: 'Séoul, Corée du Sud',
  },
  de: {
    name: 'Yeojunsu (여준수)',
    tagline: 'Studentischer Entwickler',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['Frontend-Entwicklung', 'KI-Forschung', 'Musik', 'Reisen'],
    intro: [
      'Hallo, ich bin Junsu, ein studentischer Entwickler.',
      'In meiner Freizeit erkunde ich gerne neue Technologien und arbeite an persönlichen Projekten.',
    ],
    region: 'Seoul, Südkorea',
  },
  pt: {
    name: 'Yeojunsu (여준수)',
    tagline: 'Estudante desenvolvedor',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['Desenvolvimento Frontend', 'Pesquisa em IA', 'Música', 'Viagens'],
    intro: [
      'Olá, sou Junsu, um estudante desenvolvedor.',
      'No meu tempo livre gosto de explorar novas tecnologias e trabalhar em projetos pessoais.',
    ],
    region: 'Seul, Coreia do Sul',
  },
  ru: {
    name: 'Yeojunsu (여준수)',
    tagline: 'Студент-разработчик',
    email: 'yeojoonsoo02@gmail.com',
    photo: '/profile.jpg',
    interests: ['Фронтенд-разработка', 'Исследование ИИ', 'Музыка', 'Путешествия'],
    intro: [
      'Здравствуйте, я Чунсу, студент-разработчик.',
      'В свободное время я люблю изучать новые технологии и работать над личными проектами.',
    ],
    region: 'Сеул, Южная Корея',
  },
};
