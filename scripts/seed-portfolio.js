/**
 * 포트폴리오 데이터 시드 스크립트
 * 실행: node scripts/seed-portfolio.js
 * knowledge.ts 기반 실제 정보만 사용
 */
const fs = require('fs');
const admin = require('firebase-admin');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY='(.+?)'/s);
let keyStr = match[1].replace(/\n/g, '\\n');
const key = JSON.parse(keyStr);

const app = admin.initializeApp({ credential: admin.credential.cert(key) });
const db = admin.firestore();

async function seed() {
  const col = db.collection('portfolio');

  // ── Hero ──
  await col.doc('hero_ko').set({
    headline: '여준수',
    subline: '광운대학교 소프트웨어학과 · 대학생 개발자',
  });
  console.log('hero_ko ✓');

  // ── Summary ──
  await col.doc('summary_ko').set({
    bio: '\"이거 있으면 편하겠다\" 싶은 걸 직접 만들어보는 대학생 개발자입니다. 기획부터 디자인, 개발, 배포까지 혼자 해보는 걸 좋아합니다.',
    highlights: [
      { label: '전공', value: 'SW' },
      { label: '주력', value: 'Next.js' },
      { label: '관심', value: 'AI 연동' },
    ],
  });
  console.log('summary_ko ✓');

  // ── Projects (실제 Firebase 프로젝트 기반) ──
  await col.doc('projects_ko').set({
    items: [
      {
        id: 'intro-site',
        title: '자기소개 사이트',
        description: '지금 보고 있는 이 사이트. AI 챗봇에게 저에 대해 물어볼 수 있고, 포트폴리오와 댓글 기능이 있습니다.',
        thumbnail: '',
        tags: ['Next.js', 'Firebase', 'Gemini AI', 'Tailwind CSS'],
        liveUrl: 'https://yeojoonsoo02.com',
        repoUrl: 'https://github.com/yeojoonsoo02/intro-site',
        featured: true,
        order: 1,
        category: 'web',
      },
      {
        id: 'stat-genie',
        title: 'Stat Genie',
        description: '데이터를 올리면 기초 통계 분석을 자동으로 해주는 웹 도구.',
        thumbnail: '',
        tags: ['React', 'Firebase', 'Data Analysis'],
        liveUrl: '',
        repoUrl: '',
        featured: false,
        order: 2,
        category: 'web',
      },
      {
        id: 'mathlab',
        title: 'MathLab',
        description: '수학 문제 풀이 학습 플랫폼.',
        thumbnail: '',
        tags: ['Next.js', 'Firebase'],
        liveUrl: '',
        repoUrl: '',
        featured: false,
        order: 3,
        category: 'web',
      },
      {
        id: 'feedback-app',
        title: '피드백 수집기',
        description: '수업이나 발표 후 익명 피드백을 받을 수 있는 웹앱.',
        thumbnail: '',
        tags: ['React', 'Firebase'],
        liveUrl: '',
        repoUrl: '',
        featured: false,
        order: 4,
        category: 'web',
      },
    ],
  });
  console.log('projects_ko ✓');

  // ── Skills ──
  await col.doc('skills_ko').set({
    categories: [
      {
        id: 'frontend',
        name: 'Frontend',
        items: [
          { name: 'Next.js', level: 4 },
          { name: 'React', level: 4 },
          { name: 'TypeScript', level: 4 },
          { name: 'Tailwind CSS', level: 5 },
          { name: 'HTML / CSS', level: 5 },
        ],
      },
      {
        id: 'backend',
        name: 'Backend & DB',
        items: [
          { name: 'Firebase', level: 4 },
          { name: 'Node.js', level: 3 },
          { name: 'REST API', level: 3 },
        ],
      },
      {
        id: 'ai',
        name: 'AI',
        items: [
          { name: 'Gemini API', level: 4 },
          { name: 'RAG', level: 3 },
          { name: 'Prompt Engineering', level: 4 },
        ],
      },
      {
        id: 'tools',
        name: 'Tools',
        items: [
          { name: 'Git / GitHub', level: 4 },
          { name: 'Vercel', level: 4 },
          { name: 'Figma', level: 2 },
        ],
      },
    ],
  });
  console.log('skills_ko ✓');

  // ── Timeline (knowledge.ts 기반 실제 정보) ──
  await col.doc('timeline_ko').set({
    items: [
      {
        id: 'tl-1',
        year: '2025',
        title: '자기소개 사이트 개발·운영',
        description: 'AI 챗봇, 포트폴리오, 텔레그램 연동 등 기능 지속 추가',
        type: 'project',
        order: 1,
      },
      {
        id: 'tl-2',
        year: '2024.04',
        title: '공군 전역',
        description: '공군 839기, 벽제 근무 (2022.07 입대)',
        type: 'etc',
        order: 2,
      },
      {
        id: 'tl-3',
        year: '2023',
        title: '광운대학교 소프트웨어학과 입학',
        description: '',
        type: 'education',
        order: 3,
      },
      {
        id: 'tl-4',
        year: '2022',
        title: '프로그래밍 독학 시작',
        description: 'Python → JavaScript → React 순서로 학습',
        type: 'etc',
        order: 4,
      },
    ],
  });
  console.log('timeline_ko ✓');

  console.log('\nDone!');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
