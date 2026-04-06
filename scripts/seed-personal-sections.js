/**
 * Seed personal sections: PersonalInfo, Goals, Values, Routine, Hobbies
 * + Add SMAT certificate to certifications
 */
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const content = fs.readFileSync('.env.local', 'utf8');
const match = content.match(/FIREBASE_SERVICE_ACCOUNT_KEY='([\s\S]*?)'\s*\n/);
const jsonStr = match[1].replace(/\n/g, '\\n');
const parsed = JSON.parse(jsonStr);
const app = getApps().length > 0 ? getApps()[0] : initializeApp({ credential: cert(parsed) });
const db = getFirestore(app);

const data = {
  ko: {
    personalInfo: { items: [
      { label: '생년월일', value: '2002.11.07' },
      { label: '별자리', value: '전갈자리' },
      { label: '혈액형', value: 'A형' },
      { label: 'MBTI', value: 'ENTJ' },
      { label: '키', value: '172cm' },
      { label: '지역', value: '서울 노원구' },
    ]},
    goals: { items: [
      { id: 'g1', content: '실행력 있는 사업가로 남기. 아이디어를 멈추지 않고 작게라도 만들어 검증하며 사업을 현실로 만들어가기.', order: 1 },
      { id: 'g2', content: 'GPT와 AI 활용 전문가로 이름을 알리기. 블로그, 강의, 책을 통해 경험 나누기.', order: 2 },
      { id: 'g3', content: '부동산 임대와 주식 배당으로 안정적 현금 흐름 만들기. 5년 안에 배당만으로 월 200만 원.', order: 3 },
      { id: 'g4', content: '가족에게 여유를 주고 싶음. 부모님께 차, 여행, 편안한 생활.', order: 4 },
      { id: 'g5', content: '한 번 배운 것에 머무르지 않고 계속 배우고 변화하는 사람.', order: 5 },
    ]},
    values: { items: [
      { id: 'v1', content: '자주 보고 듣고 생각하는 것이 행동으로 나타난다. 접하는 것들이 목표와 가까워야 한다.', order: 1 },
      { id: 'v2', content: '사람은 바꿀 수는 없지만 바뀔 수 있다. 변화는 두렵기보다 흥미롭다.', order: 2 },
      { id: 'v3', content: '약속을 지키는 것이 모여서 어떤 사람인지 보여준다. 말보다 행동이 먼저.', order: 3 },
      { id: 'v4', content: '작은 습관이 결국 나를 만든다. 루틴과 규칙을 만들어 지키는 것이 자신을 믿게 만드는 방법.', order: 4 },
    ]},
    routine: { items: [
      { id: 'r1', time: '06:00', content: '기상 → 물 마시기 → 유산균', order: 1 },
      { id: 'r2', time: '06:15', content: '세수, 스트레칭', order: 2 },
      { id: 'r3', time: '06:30', content: '감사일기 3가지 작성', order: 3 },
      { id: 'r4', time: '06:45', content: '메모앱에 일기 정리 → 그날 목표 3개 설정', order: 4 },
      { id: 'r5', time: '07:00', content: '하루 계획 시뮬레이션 → 집중 작업 시작', order: 5 },
      { id: 'r6', time: '오전', content: '집중력 최고 시간대 — 개발, 공부', order: 6 },
      { id: 'r7', time: '오후', content: '운동 (탁구/수영/요가) 또는 미팅', order: 7 },
      { id: 'r8', time: '저녁', content: '하루 정리, 기록 마무리, 하루일기', order: 8 },
      { id: 'r9', time: '~24:00', content: '취침 — 7~8시간 수면 확보', order: 9 },
    ]},
    hobbies: { categories: [
      { id: 'sports', name: '운동', items: ['탁구', '수영 (중급)', '요가', '스노보드', '클라이밍', '배드민턴', '다트', '스노클링'] },
      { id: 'creative', name: '크리에이티브', items: ['Suno AI 음악 제작', '개인 프로젝트 개발', '블로그 글쓰기'] },
      { id: 'travel', name: '여행', items: ['대만', '홍콩', '호주 브리즈번 (워홀 6개월)', '발리', '상하이'] },
      { id: 'mindful', name: '마인드', items: ['독서', '명상', '체스', '감사일기', '포커 딜링'] },
      { id: 'food', name: '음식 취향', items: ['고기파 (갈비, 구이)', '밥 > 빵', '면 요리 전부', '매운 거 못 먹음', '커피 거의 안 마심'] },
    ]},
  },
  en: {
    personalInfo: { items: [
      { label: 'Birthday', value: 'Nov 7, 2002' },
      { label: 'Zodiac', value: 'Scorpio' },
      { label: 'Blood Type', value: 'A' },
      { label: 'MBTI', value: 'ENTJ' },
      { label: 'Height', value: '172cm' },
      { label: 'Location', value: 'Seoul, Korea' },
    ]},
    goals: { items: [
      { id: 'g1', content: 'Be an entrepreneur with strong execution. Turn ideas into reality by building and validating, even if small.', order: 1 },
      { id: 'g2', content: 'Become known as a GPT/AI expert. Share experience through blogs, lectures, and books.', order: 2 },
      { id: 'g3', content: 'Build stable cash flow through real estate and stock dividends. Target: \u20a92M/month from dividends within 5 years.', order: 3 },
      { id: 'g4', content: 'Give my family comfort. Cars, travel, and a better life for my parents.', order: 4 },
      { id: 'g5', content: 'Never stop learning. Keep evolving and embracing change.', order: 5 },
    ]},
    values: { items: [
      { id: 'v1', content: 'What you see, hear, and think shapes your actions. Surround yourself with what aligns with your goals.', order: 1 },
      { id: 'v2', content: 'You can\'t change people, but people can change. Change is exciting, not scary.', order: 2 },
      { id: 'v3', content: 'Keeping promises defines who you are. Actions speak louder than words.', order: 3 },
      { id: 'v4', content: 'Small habits ultimately make you. Building routines and sticking to them is how you learn to trust yourself.', order: 4 },
    ]},
    routine: { items: [
      { id: 'r1', time: '06:00', content: 'Wake up \u2192 Water \u2192 Probiotics', order: 1 },
      { id: 'r2', time: '06:15', content: 'Wash up, stretch', order: 2 },
      { id: 'r3', time: '06:30', content: 'Write 3 gratitude items', order: 3 },
      { id: 'r4', time: '06:45', content: 'Journal \u2192 Set 3 daily goals', order: 4 },
      { id: 'r5', time: '07:00', content: 'Simulate the day \u2192 Start focused work', order: 5 },
      { id: 'r6', time: 'AM', content: 'Peak focus time \u2014 coding, studying', order: 6 },
      { id: 'r7', time: 'PM', content: 'Exercise (table tennis/swimming/yoga) or meetings', order: 7 },
      { id: 'r8', time: 'Evening', content: 'Wrap up, review records, daily journal', order: 8 },
      { id: 'r9', time: '~24:00', content: 'Sleep \u2014 7-8 hours target', order: 9 },
    ]},
    hobbies: { categories: [
      { id: 'sports', name: 'Sports', items: ['Table Tennis', 'Swimming (intermediate)', 'Yoga', 'Snowboarding', 'Climbing', 'Badminton', 'Darts', 'Snorkeling'] },
      { id: 'creative', name: 'Creative', items: ['AI Music (Suno)', 'Personal Projects', 'Blog Writing'] },
      { id: 'travel', name: 'Travel', items: ['Taiwan', 'Hong Kong', 'Brisbane, Australia (6mo WHV)', 'Bali', 'Shanghai'] },
      { id: 'mindful', name: 'Mindful', items: ['Reading', 'Meditation', 'Chess', 'Gratitude Journal', 'Poker Dealing'] },
      { id: 'food', name: 'Food Style', items: ['Meat lover (galbi, grilled)', 'Rice > Bread', 'All noodles', 'Can\'t handle spicy', 'Rarely drinks coffee'] },
    ]},
  },
  zh: {
    personalInfo: { items: [
      { label: '生日', value: '2002.11.07' },
      { label: '星座', value: '天蝎座' },
      { label: '血型', value: 'A型' },
      { label: 'MBTI', value: 'ENTJ' },
      { label: '身高', value: '172cm' },
      { label: '地区', value: '首尔' },
    ]},
    goals: { items: [
      { id: 'g1', content: '成为执行力强的创业者。不止于想法，哪怕从小处开始也要去做、去验证，把事业变为现实。', order: 1 },
      { id: 'g2', content: '成为GPT和AI领域的知名专家。通过博客、讲座、书籍分享经验。', order: 2 },
      { id: 'g3', content: '通过房地产租金和股票分红建立稳定现金流。目标：5年内仅靠分红月入200万韩元。', order: 3 },
      { id: 'g4', content: '让家人过得更好。给父母买车、旅行、舒适的生活。', order: 4 },
      { id: 'g5', content: '永不停止学习。持续进化，拥抱变化。', order: 5 },
    ]},
    values: { items: [
      { id: 'v1', content: '经常看到、听到、想到的东西会变成行动。要让接触的东西与目标保持一致。', order: 1 },
      { id: 'v2', content: '无法改变别人，但人可以自己改变。变化令人兴奋，而非恐惧。', order: 2 },
      { id: 'v3', content: '遵守承诺的积累体现了你是怎样的人。行动先于言语。', order: 3 },
      { id: 'v4', content: '小习惯最终塑造你。建立规则并坚持它们，是学会相信自己的方式。', order: 4 },
    ]},
    routine: { items: [
      { id: 'r1', time: '06:00', content: '起床 → 喝水 → 益生菌', order: 1 },
      { id: 'r2', time: '06:15', content: '洗脸、拉伸', order: 2 },
      { id: 'r3', time: '06:30', content: '写3条感恩日记', order: 3 },
      { id: 'r4', time: '06:45', content: '日记整理 → 设定3个当日目标', order: 4 },
      { id: 'r5', time: '07:00', content: '模拟一天 → 开始专注工作', order: 5 },
      { id: 'r6', time: '上午', content: '专注力最佳时段 — 编程、学习', order: 6 },
      { id: 'r7', time: '下午', content: '运动（乒乓球/游泳/瑜伽）或会议', order: 7 },
      { id: 'r8', time: '晚上', content: '整理一天、记录回顾、日记', order: 8 },
      { id: 'r9', time: '~24:00', content: '就寝 — 确保7-8小时睡眠', order: 9 },
    ]},
    hobbies: { categories: [
      { id: 'sports', name: '运动', items: ['乒乓球', '游泳（中级）', '瑜伽', '单板滑雪', '攀岩', '羽毛球', '飞镖', '浮潜'] },
      { id: 'creative', name: '创作', items: ['AI音乐（Suno）', '个人项目开发', '博客写作'] },
      { id: 'travel', name: '旅行', items: ['台湾', '香港', '布里斯班（打工度假6个月）', '巴厘岛', '上海'] },
      { id: 'mindful', name: '心灵', items: ['读书', '冥想', '国际象棋', '感恩日记', '扑克发牌'] },
      { id: 'food', name: '饮食偏好', items: ['肉食派（排骨、烤肉）', '米饭 > 面包', '所有面食', '不能吃辣', '几乎不喝咖啡'] },
    ]},
  },
  ja: {
    personalInfo: { items: [
      { label: '誕生日', value: '2002.11.07' },
      { label: '星座', value: 'さそり座' },
      { label: '血液型', value: 'A型' },
      { label: 'MBTI', value: 'ENTJ' },
      { label: '身長', value: '172cm' },
      { label: '地域', value: 'ソウル' },
    ]},
    goals: { items: [
      { id: 'g1', content: '実行力のある事業家になる。アイデアを止めず、小さくても作って検証し、事業を現実にしていく。', order: 1 },
      { id: 'g2', content: 'GPTとAI活用の専門家として名を上げる。ブログ、講義、本を通じて経験を共有。', order: 2 },
      { id: 'g3', content: '不動産と株式配当で安定した現金フローを構築。5年以内に配当だけで月200万ウォン。', order: 3 },
      { id: 'g4', content: '家族にゆとりを。親に車、旅行、快適な生活を。', order: 4 },
      { id: 'g5', content: '一度学んだことに留まらず、学び続け変化し続ける人間に。', order: 5 },
    ]},
    values: { items: [
      { id: 'v1', content: 'よく見て聞いて考えることが行動に表れる。触れるものが目標に近くあるべき。', order: 1 },
      { id: 'v2', content: '人を変えることはできないが、人は変わることができる。変化は怖いものではなく面白い。', order: 2 },
      { id: 'v3', content: '約束を守ることの積み重ねがどんな人かを示す。言葉より行動が先。', order: 3 },
      { id: 'v4', content: '小さな習慣が最終的に自分を作る。ルーティンを作り守ることが自分を信じる方法。', order: 4 },
    ]},
    routine: { items: [
      { id: 'r1', time: '06:00', content: '起床 → 水 → 乳酸菌', order: 1 },
      { id: 'r2', time: '06:15', content: '洗顔、ストレッチ', order: 2 },
      { id: 'r3', time: '06:30', content: '感謝日記3つ', order: 3 },
      { id: 'r4', time: '06:45', content: '日記整理 → 1日の目標3つ設定', order: 4 },
      { id: 'r5', time: '07:00', content: '一日のシミュレーション → 集中作業開始', order: 5 },
      { id: 'r6', time: '午前', content: '集中力ピーク — コーディング、勉強', order: 6 },
      { id: 'r7', time: '午後', content: '運動（卓球/水泳/ヨガ）またはミーティング', order: 7 },
      { id: 'r8', time: '夜', content: '一日のまとめ、記録整理、日記', order: 8 },
      { id: 'r9', time: '~24:00', content: '就寝 — 7~8時間確保', order: 9 },
    ]},
    hobbies: { categories: [
      { id: 'sports', name: 'スポーツ', items: ['卓球', '水泳（中級）', 'ヨガ', 'スノーボード', 'クライミング', 'バドミントン', 'ダーツ', 'シュノーケリング'] },
      { id: 'creative', name: 'クリエイティブ', items: ['AI音楽（Suno）', '個人プロジェクト開発', 'ブログ執筆'] },
      { id: 'travel', name: '旅行', items: ['台湾', '香港', 'ブリスベン（ワーホリ6ヶ月）', 'バリ', '上海'] },
      { id: 'mindful', name: 'マインド', items: ['読書', '瞑想', 'チェス', '感謝日記', 'ポーカーディーリング'] },
      { id: 'food', name: '食の好み', items: ['肉派（カルビ、焼肉）', 'ご飯 > パン', '麺類全般', '辛いもの苦手', 'コーヒーほぼ飲まない'] },
    ]},
  },
};

// Also add SMAT certificate to existing certifications
const smatCert = {
  ko: { id: 'cert-0', name: 'SMAT 컨설턴트', issuer: '한국생산성본부', date: '', url: '', order: 0 },
  en: { id: 'cert-0', name: 'SMAT Consultant', issuer: 'Korea Productivity Center', date: '', url: '', order: 0 },
  zh: { id: 'cert-0', name: 'SMAT顾问', issuer: '韩国生产性本部', date: '', url: '', order: 0 },
  ja: { id: 'cert-0', name: 'SMATコンサルタント', issuer: '韓国生産性本部', date: '', url: '', order: 0 },
};

async function main() {
  for (const [lang, sections] of Object.entries(data)) {
    const batch = db.batch();
    batch.set(db.collection('portfolio').doc(`personalInfo_${lang}`), sections.personalInfo);
    batch.set(db.collection('portfolio').doc(`goals_${lang}`), sections.goals);
    batch.set(db.collection('portfolio').doc(`values_${lang}`), sections.values);
    batch.set(db.collection('portfolio').doc(`routine_${lang}`), sections.routine);
    batch.set(db.collection('portfolio').doc(`hobbies_${lang}`), sections.hobbies);
    await batch.commit();

    // Add SMAT cert to existing certifications
    const certDoc = await db.collection('portfolio').doc(`certifications_${lang}`).get();
    const existing = certDoc.exists ? (certDoc.data().items || []) : [];
    if (!existing.find(c => c.id === 'cert-0')) {
      existing.unshift(smatCert[lang]);
      await db.collection('portfolio').doc(`certifications_${lang}`).set({ items: existing });
    }

    console.log(`[OK] ${lang.toUpperCase()} personal data seeded`);
  }
  console.log('\n✅ All personal sections + SMAT cert seeded');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
