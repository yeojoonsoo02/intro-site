/**
 * Fix portfolio data:
 * 1. Fix project ID typo (petforeset-web → petforest-web)
 * 2. Fix timeline gap (split tl-09 into two entries)
 * 3. Add EN/ZH/JA translations
 */
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

// Init Firebase Admin
const content = fs.readFileSync('.env.local', 'utf8');
const match = content.match(/FIREBASE_SERVICE_ACCOUNT_KEY='([\s\S]*?)'\s*\n/);
const jsonStr = match[1].replace(/\n/g, '\\n');
const parsed = JSON.parse(jsonStr);
const app = getApps().length > 0 ? getApps()[0] : initializeApp({ credential: cert(parsed) });
const db = getFirestore(app);

// ── 1. Fix project ID typo in KO ──
async function fixProjectId() {
  const doc = await db.collection('portfolio').doc('projects_ko').get();
  if (!doc.exists) return;
  const data = doc.data();
  const items = data.items.map((p) =>
    p.id === 'petforeset-web' ? { ...p, id: 'petforest-web' } : p
  );
  await db.collection('portfolio').doc('projects_ko').set({ items });
  console.log('[OK] Project ID typo fixed (petforeset → petforest)');
}

// ── 2. Fix timeline gap ──
async function fixTimeline() {
  const doc = await db.collection('portfolio').doc('timeline_ko').get();
  if (!doc.exists) return;
  const data = doc.data();

  // Replace tl-09 with two entries and renumber
  const newItems = [
    ...data.items.filter((i) => i.order <= 8),
    {
      id: 'tl-09',
      year: '2024.11',
      title: '귀국 · 챗코가 사업 시작',
      description:
        '호주에서 돌아온 뒤 챗코가 사업을 본격 운영하며 외주 개발을 시작했다. 웹/앱 개발 의뢰를 받아 다양한 프로젝트를 진행했다.',
      type: 'work',
      order: 9,
    },
    {
      id: 'tl-10',
      year: '2025.09',
      title: '광운대학교 복학',
      description:
        '2025년 2학기에 광운대 소프트웨어학부에 복학. 학업과 사업을 병행하기 시작했다.',
      type: 'education',
      order: 10,
    },
    {
      id: 'tl-11',
      year: '2025',
      title: '대학 수업 · 프로젝트 병행',
      description:
        '자료구조, 객체지향, 시스템 소프트웨어, 기술경영과 마케팅 등 전공 수업을 들으며 스타트업 최종발표, D\'velop 취창업 페스티벌 참가.',
      type: 'education',
      order: 11,
    },
    {
      id: 'tl-12',
      year: '2026',
      title: '동아리 · 외주 · 서비스 운영',
      description:
        '똑똑집단 연합 동아리 활동, 고수학전문학원 시스템 운영, 펫포레스트 미팅, 식단하조·AI써보조·피크닉가조 등 다양한 조모임 참여. 학교와 사업을 병행하며 새로운 경험을 계속 넓히는 중.',
      type: 'work',
      order: 12,
    },
  ];

  await db.collection('portfolio').doc('timeline_ko').set({ items: newItems });
  console.log('[OK] Timeline gap fixed (tl-09 split into two, renumbered)');
}

// ── 3. Add translations ──

const translations = {
  en: {
    hero: {
      headline: 'Joonsoo Yeo',
      subline: 'Kwangwoon University, Dept. of Software · Student Developer',
    },
    summary: {
      bio: 'I\'m a university student developer who builds things whenever I think "this would be useful." I enjoy handling everything from planning and design to development and deployment on my own. I\'ve gained diverse experience through a working holiday in Australia, running the Chatkoga business, and freelance development.',
      highlights: [
        { label: 'Major', value: 'SW' },
        { label: 'Main Stack', value: 'Next.js' },
        { label: 'Interest', value: 'AI Integration' },
      ],
    },
    skills: {
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
    },
    projects: {
      items: [
        {
          id: 'intro-site',
          title: 'Personal Portfolio Site',
          description:
            'An interactive portfolio site built for personal branding. Supports 4 languages (Korean, English, Japanese, Chinese) and features a Gemini AI chatbot for visitors. Includes portfolio, guestbook, and admin mode.',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Gemini AI', 'Tailwind CSS', 'i18n'],
          liveUrl: 'https://yeojoonsoo02.com',
          featured: true,
          order: 1,
          category: 'web',
        },
        {
          id: 'stat-genie',
          title: 'Stat Genie',
          description:
            'A SaaS statistics analysis web tool developed for StatPodegree. Provides Sobel test (mediation analysis), AVE/CR calculator (convergent validity), effect size calculator (Cohen\'s d, Hedges\' g), and data processing tools for researchers and graduate students.',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Statistics', 'SaaS'],
          liveUrl: 'https://www.stat-genie.com',
          featured: true,
          order: 2,
          category: 'web',
        },
        {
          id: 'yeojoonsoo02-db',
          title: 'Dashboard Management System',
          description:
            'An integrated management platform built for running a personal business. Records and tracks customer info, project progress, financial records, and task schedules in one place.',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Firestore', 'Dashboard'],
          liveUrl: 'https://db.yeojoonsoo02.com',
          featured: false,
          order: 3,
          category: 'web',
        },
        {
          id: 'gops',
          title: 'GoPS - Academy Management System',
          description:
            'A student management system used at Go Math Academy. Provides student info management, question bank-based exam creation with auto-grading, and grade dashboards to digitize academy operations.',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Education', 'Dashboard'],
          liveUrl: 'https://gops-puce.vercel.app',
          featured: true,
          order: 4,
          category: 'web',
        },
        {
          id: 'petforest-web',
          title: 'GM Korea',
          description:
            'A website built for Petforest\'s GM Jewelry brand. Showcases brand story and product lineup, with an AI-powered consultation feature.',
          thumbnail: '',
          tags: ['Next.js', 'AI Chatbot', 'Firebase', 'Tailwind CSS'],
          liveUrl: '',
          featured: true,
          order: 5,
          category: 'web',
        },
        {
          id: 'estimate-page',
          title: 'Chatkoga',
          description:
            'A business site for Chatkoga\'s service introduction and cost estimation. Select features for web/app projects to auto-calculate estimated costs, with service info, reviews, and KakaoTalk consultation.',
          thumbnail: '',
          tags: ['Next.js', 'Vercel', 'Business', 'Landing Page'],
          liveUrl: 'https://estimatepage.vercel.app',
          featured: false,
          order: 6,
          category: 'web',
        },
        {
          id: 'mathlab',
          title: 'MathLab',
          description:
            'An educational app for learning math in a fun way. Provides problem creation, solving, and grading with gamification elements to boost learning motivation.',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Education', 'Gamification'],
          liveUrl: '',
          featured: false,
          order: 7,
          category: 'web',
        },
        {
          id: 'sikdan-hajo',
          title: 'Sikdan Hajo (Diet Together)',
          description:
            'A collaborative diet management service built for a club group. Members log daily meals and get automatic nutritional analysis.',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Nutrition API', 'Tailwind CSS'],
          liveUrl: 'https://sikdan-hajo.vercel.app',
          featured: false,
          order: 8,
          category: 'web',
        },
        {
          id: 'feedback',
          title: 'Feedback System',
          description:
            'A feedback tool for Chatkoga clients to submit revision requests more precisely. Access via project code to submit requests with photos and track progress. Designed with onboarding for non-developer clients.',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Image Upload', 'Project Management'],
          liveUrl: 'https://feedback.chatgptkrguide.com',
          featured: false,
          order: 9,
          category: 'web',
        },
      ],
    },
    timeline: {
      items: [
        { id: 'tl-01', year: '2002', title: 'Born in Seoul, Raised in Gimpo', description: 'Born in Seoul and grew up in Gimpo from age 1. A Gimpo local for about 21 years.', type: 'etc', order: 1 },
        { id: 'tl-02', year: '2009–2014', title: 'Elementary School', description: 'Transferred twice: Gochang → Pureunsol → Hanulbit Elementary. Served as vice president at Hanulbit.', type: 'education', order: 2 },
        { id: 'tl-03', year: '2015–2017', title: 'Hanulbit Middle School', description: 'Class president in 1st grade, vice president in 2nd. Started self-learning coding in 2nd grade.', type: 'education', order: 3 },
        { id: 'tl-04', year: '2018–2020', title: 'Unyang High School', description: 'Met friends who also aspired to be developers and decided to major in software engineering.', type: 'education', order: 4 },
        { id: 'tl-05', year: '2021', title: 'Entered Kwangwoon University', description: 'Admitted to the Dept. of Software through math essay exam. Spent the first year mostly in online classes due to COVID.', type: 'education', order: 5 },
        { id: 'tl-06', year: '2022.07', title: 'Enlisted in the Air Force (839th)', description: 'Chose the Air Force for the shorter gap. Military service became a turning point — challenged things I avoided. Changed from INFP to ESTJ, now ENTJ.', type: 'work', order: 6 },
        { id: 'tl-07', year: '2024.04', title: 'Discharged from Air Force', description: 'After 1 year and 9 months of morning routines, blogging, reading, studying English, and exercising, came out a completely different person.', type: 'work', order: 7 },
        { id: 'tl-08', year: '2024.05–10', title: 'Working Holiday in Brisbane, Australia', description: 'A 5-month working holiday in Brisbane right after discharge. Gained diverse experiences in a new environment.', type: 'etc', order: 8 },
        { id: 'tl-09', year: '2024.11', title: 'Return to Korea · Started Chatkoga Business', description: 'After returning from Australia, began running the Chatkoga business full-time and started taking on freelance web/app development projects.', type: 'work', order: 9 },
        { id: 'tl-10', year: '2025.09', title: 'Returned to Kwangwoon University', description: 'Re-enrolled at Kwangwoon University for the 2nd semester of 2025. Began balancing studies with business.', type: 'education', order: 10 },
        { id: 'tl-11', year: '2025', title: 'Coursework · Projects', description: 'Took courses in Data Structures, OOP, System Software, and Technology Management. Participated in startup finals and D\'velop Career Festival.', type: 'education', order: 11 },
        { id: 'tl-12', year: '2026', title: 'Clubs · Freelance · Service Operations', description: 'Active in Ttokttok Jipdan club, managing GoPS academy system, meeting with Petforest, and participating in various group projects. Continuing to expand experiences while balancing school and business.', type: 'work', order: 12 },
      ],
    },
  },
  zh: {
    hero: {
      headline: '吕俊秀',
      subline: '光云大学软件学部 · 大学生开发者',
    },
    summary: {
      bio: '我是一个"觉得有这个会方便"就自己动手做出来的大学生开发者。从策划、设计到开发、部署，喜欢独立完成全流程。我通过澳大利亚打工度假、ChatKoga创业运营、外包开发等积累了丰富的经验。',
      highlights: [
        { label: '专业', value: 'SW' },
        { label: '主力', value: 'Next.js' },
        { label: '兴趣', value: 'AI集成' },
      ],
    },
    skills: {
      categories: [
        {
          id: 'frontend',
          name: '前端',
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
          name: '后端 & 数据库',
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
          name: '工具',
          items: [
            { name: 'Git / GitHub', level: 4 },
            { name: 'Vercel', level: 4 },
            { name: 'Figma', level: 2 },
          ],
        },
      ],
    },
    projects: {
      items: [
        {
          id: 'intro-site',
          title: '个人介绍网站',
          description: '为个人品牌打造的互动自我介绍网站。支持韩语、英语、日语、中文四种语言，并提供基于Gemini AI的聊天机器人。包含作品集、留言板、管理员模式等功能。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Gemini AI', 'Tailwind CSS', 'i18n'],
          liveUrl: 'https://yeojoonsoo02.com',
          featured: true,
          order: 1,
          category: 'web',
        },
        {
          id: 'stat-genie',
          title: 'Stat Genie',
          description: 'StatPodegree公司的SaaS统计分析网页工具。为研究者和研究生提供Sobel检验（中介效应验证）、AVE/CR计算器（收敛效度评估）、效果量计算器（Cohen\'s d, Hedges\' g）及数据处理工具。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Statistics', 'SaaS'],
          liveUrl: 'https://www.stat-genie.com',
          featured: true,
          order: 2,
          category: 'web',
        },
        {
          id: 'yeojoonsoo02-db',
          title: '仪表盘管理系统',
          description: '为个人事业运营制作的综合管理平台。在一个地方记录和追踪客户信息、项目进度、财务记录和工作日程。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Firestore', 'Dashboard'],
          liveUrl: 'https://db.yeojoonsoo02.com',
          featured: false,
          order: 3,
          category: 'web',
        },
        {
          id: 'gops',
          title: 'GoPS - 学院管理系统',
          description: '在高数学专门学院实际使用的学院管理系统。提供学生信息管理、题库出题与自动评分、成绩仪表盘，实现了学院运营数字化。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Education', 'Dashboard'],
          liveUrl: 'https://gops-puce.vercel.app',
          featured: true,
          order: 4,
          category: 'web',
        },
        {
          id: 'petforest-web',
          title: 'GM Korea',
          description: '为Petforest的GM珠宝品牌制作的网站。展示品牌故事和产品系列，并包含AI咨询功能。',
          thumbnail: '',
          tags: ['Next.js', 'AI Chatbot', 'Firebase', 'Tailwind CSS'],
          liveUrl: '',
          featured: true,
          order: 5,
          category: 'web',
        },
        {
          id: 'estimate-page',
          title: 'ChatKoga',
          description: 'ChatKoga的服务介绍与报价网站。选择Web/App开发项目功能即可自动计算预算，提供服务说明、客户评价和KakaoTalk咨询。',
          thumbnail: '',
          tags: ['Next.js', 'Vercel', 'Business', 'Landing Page'],
          liveUrl: 'https://estimatepage.vercel.app',
          featured: false,
          order: 6,
          category: 'web',
        },
        {
          id: 'mathlab',
          title: 'MathLab',
          description: '让学习数学变得有趣的教育应用。提供出题、解题、评分功能，通过游戏化元素提高学习动力。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Education', 'Gamification'],
          liveUrl: '',
          featured: false,
          order: 7,
          category: 'web',
        },
        {
          id: 'sikdan-hajo',
          title: '一起管饮食',
          description: '为聪明集团联合社团小组制作的协作饮食管理服务。组员每天记录饮食，自动分析营养成分。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Nutrition API', 'Tailwind CSS'],
          liveUrl: 'https://sikdan-hajo.vercel.app',
          featured: false,
          order: 8,
          category: 'web',
        },
        {
          id: 'feedback',
          title: '反馈系统',
          description: '为ChatKoga客户制作的反馈工具，用于更精确、更快速地收集修改请求。通过项目代码访问，附照片提交请求并跟踪进度。通过引导流程让非开发者客户也能轻松使用。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Image Upload', 'Project Management'],
          liveUrl: 'https://feedback.chatgptkrguide.com',
          featured: false,
          order: 9,
          category: 'web',
        },
      ],
    },
    timeline: {
      items: [
        { id: 'tl-01', year: '2002', title: '出生于首尔，成长于金浦', description: '在首尔出生，1岁起在金浦长大。在金浦生活了约21年。', type: 'etc', order: 1 },
        { id: 'tl-02', year: '2009–2014', title: '小学', description: '转学两次：高昌初 → 碧绿松初 → 天光初。在天光初担任全校副会长。', type: 'education', order: 2 },
        { id: 'tl-03', year: '2015–2017', title: '天光中学', description: '一年级班长，二年级副班长。中二开始自学编程。', type: 'education', order: 3 },
        { id: 'tl-04', year: '2018–2020', title: '云阳高中', description: '遇到同样梦想成为开发者的朋友，决心报考软件工程专业。', type: 'education', order: 4 },
        { id: 'tl-05', year: '2021', title: '进入光云大学软件学部', description: '通过数学论述考试考入光云大学软件学部。由于新冠疫情，大部分课程在线上进行。', type: 'education', order: 5 },
        { id: 'tl-06', year: '2022.07', title: '空军入伍（第839期）', description: '选择空白期较短的空军。军旅生活成为人生转折点——主动挑战厌恶和困难的事。从INFP变为ESTJ，现在是ENTJ。', type: 'work', order: 6 },
        { id: 'tl-07', year: '2024.04', title: '空军退役', description: '1年9个月间坚持晨间习惯、写博客、读书、学英语、运动，脱胎换骨般地回归。', type: 'work', order: 7 },
        { id: 'tl-08', year: '2024.05–10', title: '澳大利亚布里斯班打工度假', description: '退役后立即前往布里斯班，进行了约5个月的打工度假。在新环境中积累了多样的经验。', type: 'etc', order: 8 },
        { id: 'tl-09', year: '2024.11', title: '回国 · 创办ChatKoga', description: '从澳大利亚回来后，正式运营ChatKoga事业，开始接受Web/App开发外包项目。', type: 'work', order: 9 },
        { id: 'tl-10', year: '2025.09', title: '光云大学复学', description: '2025年第二学期复学光云大学。开始兼顾学业和事业。', type: 'education', order: 10 },
        { id: 'tl-11', year: '2025', title: '大学课程 · 项目并行', description: '学习数据结构、面向对象、系统软件、技术经营与营销等专业课程。参加创业最终发表和D\'velop就业创业节。', type: 'education', order: 11 },
        { id: 'tl-12', year: '2026', title: '社团 · 外包 · 服务运营', description: '聪明集团联合社团活动、高数学学院系统运营、Petforest会议、饮食管理·AI体验·野餐等各种小组参与。边上学边创业，持续拓展新的经验。', type: 'work', order: 12 },
      ],
    },
  },
  ja: {
    hero: {
      headline: 'ヨ・ジュンス',
      subline: '光云大学ソフトウェア学部 · 大学生エンジニア',
    },
    summary: {
      bio: '「これがあったら便利だな」と思ったものを自分で作る大学生エンジニアです。企画からデザイン、開発、デプロイまで一人でこなすのが好きです。オーストラリアのワーホリ、ChatKogaの事業運営、受託開発など多様な経験を積んでいます。',
      highlights: [
        { label: '専攻', value: 'SW' },
        { label: 'メイン', value: 'Next.js' },
        { label: '関心', value: 'AI連携' },
      ],
    },
    skills: {
      categories: [
        {
          id: 'frontend',
          name: 'フロントエンド',
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
          name: 'バックエンド & DB',
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
          name: 'ツール',
          items: [
            { name: 'Git / GitHub', level: 4 },
            { name: 'Vercel', level: 4 },
            { name: 'Figma', level: 2 },
          ],
        },
      ],
    },
    projects: {
      items: [
        {
          id: 'intro-site',
          title: '自己紹介サイト',
          description: 'パーソナルブランディングのために制作したインタラクティブな自己紹介サイト。韓国語・英語・日本語・中国語の4言語に対応し、Gemini AIチャットボットで訪問者と対話できる。ポートフォリオ、ゲストブック、管理者モードなどの機能を搭載。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Gemini AI', 'Tailwind CSS', 'i18n'],
          liveUrl: 'https://yeojoonsoo02.com',
          featured: true,
          order: 1,
          category: 'web',
        },
        {
          id: 'stat-genie',
          title: 'Stat Genie',
          description: 'StatPodegree社のSaaS統計分析ウェブツール。研究者や大学院生向けにSobel検定（媒介効果検証）、AVE/CR計算機（収束妥当性評価）、効果量計算機（Cohen\'s d, Hedges\' g）、データ処理ツールを提供。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Statistics', 'SaaS'],
          liveUrl: 'https://www.stat-genie.com',
          featured: true,
          order: 2,
          category: 'web',
        },
        {
          id: 'yeojoonsoo02-db',
          title: 'ダッシュボード管理システム',
          description: '個人事業運営のために制作した統合管理プラットフォーム。顧客情報、プロジェクト進捗、財務記録、業務スケジュールを一箇所で記録・追跡。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Firestore', 'Dashboard'],
          liveUrl: 'https://db.yeojoonsoo02.com',
          featured: false,
          order: 3,
          category: 'web',
        },
        {
          id: 'gops',
          title: 'GoPS - 塾管理システム',
          description: '高数学専門塾で実際に使用中の塾管理システム。生徒情報管理、問題バンクに基づく試験作成と自動採点、成績ダッシュボード機能で塾運営をデジタル化。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Education', 'Dashboard'],
          liveUrl: 'https://gops-puce.vercel.app',
          featured: true,
          order: 4,
          category: 'web',
        },
        {
          id: 'petforest-web',
          title: 'GM Korea',
          description: 'PetforestのGMジュエリーブランド紹介用ウェブサイト。ブランドストーリーと商品ラインナップを紹介し、AIベースの相談機能を搭載。',
          thumbnail: '',
          tags: ['Next.js', 'AI Chatbot', 'Firebase', 'Tailwind CSS'],
          liveUrl: '',
          featured: true,
          order: 5,
          category: 'web',
        },
        {
          id: 'estimate-page',
          title: 'ChatKoga',
          description: 'ChatKogaのサービス紹介と見積もりサイト。Web/App開発プロジェクトの機能を選択すると予想費用を自動計算。サービス案内、顧客レビュー、KakaoTalk相談連携機能を提供。',
          thumbnail: '',
          tags: ['Next.js', 'Vercel', 'Business', 'Landing Page'],
          liveUrl: 'https://estimatepage.vercel.app',
          featured: false,
          order: 6,
          category: 'web',
        },
        {
          id: 'mathlab',
          title: 'MathLab',
          description: '数学を楽しく学習できる教育アプリ。問題作成、解答、採点機能を提供し、ゲーミフィケーション要素で学習意欲を高める。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Education', 'Gamification'],
          liveUrl: '',
          featured: false,
          order: 7,
          category: 'web',
        },
        {
          id: 'sikdan-hajo',
          title: '食単ハジョ（一緒に食事管理）',
          description: 'トットクジプダン連合サークルのグループで一緒に食事管理するために制作。メンバーが毎日の食事を記録すると栄養素を自動分析する協業食事管理サービス。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Nutrition API', 'Tailwind CSS'],
          liveUrl: 'https://sikdan-hajo.vercel.app',
          featured: false,
          order: 8,
          category: 'web',
        },
        {
          id: 'feedback',
          title: 'フィードバックシステム',
          description: 'ChatKogaクライアントの修正依頼をより正確かつ迅速に収集するためのフィードバックツール。プロジェクトコードでアクセスし、写真付きで修正依頼を送信・進捗追跡が可能。オンボーディングで非開発者クライアントでも簡単に使用可能。',
          thumbnail: '',
          tags: ['Next.js', 'Firebase', 'Image Upload', 'Project Management'],
          liveUrl: 'https://feedback.chatgptkrguide.com',
          featured: false,
          order: 9,
          category: 'web',
        },
      ],
    },
    timeline: {
      items: [
        { id: 'tl-01', year: '2002', title: 'ソウル出生、金浦で成長', description: 'ソウルで生まれ、1歳から金浦で育つ。約21年間金浦在住。', type: 'etc', order: 1 },
        { id: 'tl-02', year: '2009–2014', title: '小学校', description: '2回転校：コチャン初 → プルンソル初 → ハヌルビッ初。ハヌルビッ初で全校副会長。', type: 'education', order: 2 },
        { id: 'tl-03', year: '2015–2017', title: 'ハヌルビッ中学校', description: '1年生でクラス委員長、2年生で副委員長。中2でプログラミング独学を開始。', type: 'education', order: 3 },
        { id: 'tl-04', year: '2018–2020', title: 'ウニャン高等学校', description: '開発者を目指す友人たちと出会い、ソフトウェア学科への進学を決意。', type: 'education', order: 4 },
        { id: 'tl-05', year: '2021', title: '光云大学ソフトウェア学部入学', description: '数理論述で光云大学ソフトウェア学部に合格。コロナの影響でほぼオンライン授業の1年間。', type: 'education', order: 5 },
        { id: 'tl-06', year: '2022.07', title: '空軍入隊（839期）', description: 'ブランクが短い空軍を選択。軍隊生活が人生のターニングポイントに。苦手なことにあえて挑戦し、INFPからESTJ、今はENTJに変化。', type: 'work', order: 6 },
        { id: 'tl-07', year: '2024.04', title: '空軍除隊', description: '1年9ヶ月間、朝のルーティン、ブログ、読書、英語学習、運動を繰り返し、まったく別人になって帰還。', type: 'work', order: 7 },
        { id: 'tl-08', year: '2024.05–10', title: 'オーストラリア・ブリスベン ワーキングホリデー', description: '除隊直後にブリスベンへ。約5ヶ月間のワーキングホリデーで新しい環境で多様な経験を積む。', type: 'etc', order: 8 },
        { id: 'tl-09', year: '2024.11', title: '帰国 · ChatKoga事業開始', description: 'オーストラリアから帰国後、ChatKoga事業を本格運営。Web/App開発の受託案件に取り組み始める。', type: 'work', order: 9 },
        { id: 'tl-10', year: '2025.09', title: '光云大学復学', description: '2025年後期に光云大学ソフトウェア学部に復学。学業と事業の両立を開始。', type: 'education', order: 10 },
        { id: 'tl-11', year: '2025', title: '大学授業 · プロジェクト並行', description: 'データ構造、オブジェクト指向、システムソフトウェア、技術経営とマーケティング等の専攻科目を履修。スタートアップ最終発表、D\'velop就活フェスティバル参加。', type: 'education', order: 11 },
        { id: 'tl-12', year: '2026', title: 'サークル · 受託 · サービス運営', description: 'トットクジプダン連合サークル活動、GoPS塾システム運営、Petforestミーティング、食事管理・AI体験・ピクニック等の各種グループ参加。学校と事業を両立しながら新しい経験を広げ続ける。', type: 'work', order: 12 },
      ],
    },
  },
};

async function addTranslations() {
  for (const [lang, data] of Object.entries(translations)) {
    const batch = db.batch();
    batch.set(db.collection('portfolio').doc(`hero_${lang}`), data.hero);
    batch.set(db.collection('portfolio').doc(`summary_${lang}`), data.summary);
    batch.set(db.collection('portfolio').doc(`skills_${lang}`), data.skills);
    batch.set(db.collection('portfolio').doc(`projects_${lang}`), data.projects);
    batch.set(db.collection('portfolio').doc(`timeline_${lang}`), data.timeline);
    await batch.commit();
    console.log(`[OK] ${lang.toUpperCase()} translation added`);
  }
}

async function main() {
  try {
    await fixProjectId();
    await fixTimeline();
    await addTranslations();
    console.log('\n✅ All fixes applied successfully');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
