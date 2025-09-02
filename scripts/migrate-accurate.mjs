import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0SEgiLTh9jpUg5Ca-yLnBQ6aK85b4oDw",
  authDomain: "intro-site-e88aa.firebaseapp.com",
  projectId: "intro-site-e88aa",
  storageBucket: "intro-site-e88aa.firebasestorage.app",
  messagingSenderId: "899682203152",
  appId: "1:899682203152:web:958e9a308ccb1f3655bc95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateAccurateProfiles() {
  try {
    console.log('Creating accurate translations based on existing data...');

    // Main profile translations based on actual data
    const mainProfiles = {
      ko: {
        name: '여준수',
        tagline: '대학생 & 취미 개발자',
        email: 'yeojoonsoo02@gmail.com',
        photo: '/profile.jpg',
        interests: [
          {
            label: '수영',
            url: 'https://blog.naver.com/PostView.naver?blogId=yeojoonsoo02&logNo=223838547436&categoryNo=15&parentCategoryNo=&from=thumbnailList'
          },
          { 
            label: '탁구',
            url: 'https://www.band.us/@asd5359'
          },
          {
            label: '독서',
            url: 'https://blog.naver.com/PostList.naver?blogId=yeojoonsoo02&categoryNo=9&skinType=&skinId=&from=menu'
          },
          { 
            label: '체스',
            url: 'https://www.chess.com/member/yeojoonsoo02'
          }
        ],
        intro: [
          '안녕하세요 궁금한 건 AI에게 물어보세요.',
          '운동하는 거 좋아합니다 운동하자고 부르면 바로 나갑니다.',
          '음식은 다 좋아하지만 매운 건 못 먹습니다.',
          '뭐든 해보는 걸 좋아해서 자꾸 새로운 일에 손대는 중이에요.'
        ],
        region: '경기도 김포시 운양동'
      },
      en: {
        name: 'Junsu Yeo',
        tagline: 'University Student & Hobby Developer',
        email: 'yeojoonsoo02@gmail.com',
        photo: '/profile.jpg',
        interests: [
          {
            label: 'Swimming',
            url: 'https://blog.naver.com/PostView.naver?blogId=yeojoonsoo02&logNo=223838547436&categoryNo=15&parentCategoryNo=&from=thumbnailList'
          },
          { 
            label: 'Table Tennis',
            url: 'https://www.band.us/@asd5359'
          },
          {
            label: 'Reading',
            url: 'https://blog.naver.com/PostList.naver?blogId=yeojoonsoo02&categoryNo=9&skinType=&skinId=&from=menu'
          },
          { 
            label: 'Chess',
            url: 'https://www.chess.com/member/yeojoonsoo02'
          }
        ],
        intro: [
          'Hello! Feel free to ask the AI if you have any questions.',
          'I love exercising. Just call me anytime for a workout session!',
          'I enjoy all kinds of food, but I can\'t handle spicy dishes.',
          'I love trying new things, so I\'m always getting into new activities.'
        ],
        region: 'Unyang-dong, Gimpo-si, Gyeonggi-do'
      },
      ja: {
        name: '여준수 (ヨ・ジュンス)',
        tagline: '大学生 & 趣味開発者',
        email: 'yeojoonsoo02@gmail.com',
        photo: '/profile.jpg',
        interests: [
          {
            label: '水泳',
            url: 'https://blog.naver.com/PostView.naver?blogId=yeojoonsoo02&logNo=223838547436&categoryNo=15&parentCategoryNo=&from=thumbnailList'
          },
          { 
            label: '卓球',
            url: 'https://www.band.us/@asd5359'
          },
          {
            label: '読書',
            url: 'https://blog.naver.com/PostList.naver?blogId=yeojoonsoo02&categoryNo=9&skinType=&skinId=&from=menu'
          },
          { 
            label: 'チェス',
            url: 'https://www.chess.com/member/yeojoonsoo02'
          }
        ],
        intro: [
          'こんにちは！気になることがあればAIに聞いてください。',
          '運動が大好きです。運動しようと誘われたらすぐに行きます！',
          '食べ物は何でも好きですが、辛いものは苦手です。',
          '何でも挑戦するのが好きなので、いつも新しいことに手を出しています。'
        ],
        region: '京畿道金浦市雲陽洞'
      },
      zh: {
        name: '余俊秀',
        tagline: '大学生 & 业余开发者',
        email: 'yeojoonsoo02@gmail.com',
        photo: '/profile.jpg',
        interests: [
          {
            label: '游泳',
            url: 'https://blog.naver.com/PostView.naver?blogId=yeojoonsoo02&logNo=223838547436&categoryNo=15&parentCategoryNo=&from=thumbnailList'
          },
          { 
            label: '乒乓球',
            url: 'https://www.band.us/@asd5359'
          },
          {
            label: '阅读',
            url: 'https://blog.naver.com/PostList.naver?blogId=yeojoonsoo02&categoryNo=9&skinType=&skinId=&from=menu'
          },
          { 
            label: '国际象棋',
            url: 'https://www.chess.com/member/yeojoonsoo02'
          }
        ],
        intro: [
          '你好！有什么疑问可以问AI。',
          '我喜欢运动，叫我一起运动的话我会立刻出去！',
          '我喜欢所有的食物，但是不能吃辣的。',
          '我喜欢尝试各种新事物，所以总是在接触新的东西。'
        ],
        region: '京畿道金浦市云阳洞'
      }
    };

    // Dev profile translations based on actual data
    const devProfiles = {
      ko: {
        name: '챗코가',
        tagline: 'AI 전문가 & 사업가',
        email: 'chatgptkrguide@gmail.com',
        photo: '/profile.jpg',
        interests: [
          { label: 'SNS 마케팅', url: '' },
          { label: '블로그 자동화', url: '' },
          { label: 'AI API 활용', url: '' }
        ],
        intro: [
          'AI 활용 콘텐츠 제작자이자 소프트웨어 개발자입니다.',
          'GPT와 같은 생성형 AI를 누구나 쉽게 활용할 수 있도록 돕는 콘텐츠를 만들고 있습니다',
          '현재는 GPT API 활용 프로젝트를 진행 중입니다.',
          'AI 활용이나 자동화에 관심 있다면 연락 주세요'
        ],
        region: '경기도 김포시 운양동'
      },
      en: {
        name: 'ChatKorea',
        tagline: 'AI Expert & Entrepreneur',
        email: 'chatgptkrguide@gmail.com',
        photo: '/profile.jpg',
        interests: [
          { label: 'SNS Marketing', url: '' },
          { label: 'Blog Automation', url: '' },
          { label: 'AI API Utilization', url: '' }
        ],
        intro: [
          'I am an AI content creator and software developer.',
          'I create content to help everyone easily utilize generative AI like GPT.',
          'Currently working on projects utilizing GPT API.',
          'Contact me if you\'re interested in AI utilization or automation.'
        ],
        region: 'Unyang-dong, Gimpo-si, Gyeonggi-do'
      },
      ja: {
        name: 'チャットコリア',
        tagline: 'AI専門家 & 起業家',
        email: 'chatgptkrguide@gmail.com',
        photo: '/profile.jpg',
        interests: [
          { label: 'SNSマーケティング', url: '' },
          { label: 'ブログ自動化', url: '' },
          { label: 'AI API活用', url: '' }
        ],
        intro: [
          'AI活用コンテンツクリエイター兼ソフトウェア開発者です。',
          'GPTのような生成AIを誰でも簡単に活用できるようにサポートするコンテンツを作っています。',
          '現在はGPT API活用プロジェクトを進めています。',
          'AI活用や自動化に興味がある方はお問い合わせください。'
        ],
        region: '京畿道金浦市雲陽洞'
      },
      zh: {
        name: '聊天韩国',
        tagline: 'AI专家 & 企业家',
        email: 'chatgptkrguide@gmail.com',
        photo: '/profile.jpg',
        interests: [
          { label: 'SNS营销', url: '' },
          { label: '博客自动化', url: '' },
          { label: 'AI API应用', url: '' }
        ],
        intro: [
          '我是AI内容创作者兼软件开发者。',
          '我创建内容帮助大家轻松使用像GPT这样的生成式AI。',
          '目前正在进行GPT API应用项目。',
          '如果您对AI应用或自动化感兴趣，请联系我。'
        ],
        region: '京畿道金浦市云阳洞'
      }
    };

    // Save all profiles to Firebase
    console.log('Saving accurately translated profiles to Firebase...');
    
    for (const [lang, profile] of Object.entries(mainProfiles)) {
      await setDoc(doc(db, 'profiles', `main_${lang}`), profile);
      console.log(`✅ Saved main_${lang}`);
    }
    
    for (const [lang, profile] of Object.entries(devProfiles)) {
      await setDoc(doc(db, 'profiles', `dev_${lang}`), profile);
      console.log(`✅ Saved dev_${lang}`);
    }

    console.log('✨ Accurate migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
  
  process.exit(0);
}

// Run migration
migrateAccurateProfiles();