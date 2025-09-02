import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase configuration - hardcoded for migration
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

async function migrateProfiles() {
  try {
    // Fetch existing profiles
    console.log('Fetching existing profiles...');
    const mainDoc = await getDoc(doc(db, 'profiles', 'main'));
    const devDoc = await getDoc(doc(db, 'profiles', 'dev'));
    
    let mainProfile = null;
    let devProfile = null;

    if (mainDoc.exists()) {
      mainProfile = mainDoc.data();
      console.log('Found main profile:', mainProfile);
    }

    if (devDoc.exists()) {
      devProfile = devDoc.data();
      console.log('Found dev profile:', devProfile);
    }

    // If no existing profiles, use defaults
    if (!mainProfile) {
      mainProfile = {
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
      };
    }

    if (!devProfile) {
      devProfile = {
        name: 'Junsu Yeo',
        tagline: 'Student Developer',
        email: 'yeojoonsoo02@gmail.com',
        photo: '/profile.jpg',
        interests: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Python'],
        intro: [
          'Passionate about creating modern web applications.',
          'Always learning and exploring new technologies.',
        ],
        region: 'Incheon, South Korea',
      };
    }

    // Create Korean translations
    const koMainProfile = {
      ...mainProfile,
      name: '여준수',
      tagline: '대학생 개발자',
      interests: mainProfile.interests.map(interest => {
        if (typeof interest === 'string') {
          const translations = {
            'Frontend development': '프론트엔드 개발',
            'AI research': 'AI 연구',
            'Music': '음악',
            'Travel': '여행',
          };
          return translations[interest] || interest;
        }
        return interest;
      }),
      intro: [
        '안녕하세요, 저는 대학생 개발자 준수입니다.',
        '여가 시간에는 새로운 기술을 탐구하고 개인 프로젝트를 진행하는 것을 좋아합니다.',
      ],
      region: '인천, 대한민국',
    };

    const koDevProfile = {
      ...devProfile,
      name: '여준수',
      tagline: '대학생 개발자',
      intro: [
        '현대적인 웹 애플리케이션 개발에 열정을 가지고 있습니다.',
        '항상 새로운 기술을 배우고 탐구하고 있습니다.',
      ],
      region: '인천, 대한민국',
    };

    // Create Japanese translations
    const jaMainProfile = {
      ...mainProfile,
      name: '여준수 (ヨ・ジュンス)',
      tagline: '大学生開発者',
      interests: mainProfile.interests.map(interest => {
        if (typeof interest === 'string') {
          const translations = {
            'Frontend development': 'フロントエンド開発',
            'AI research': 'AI研究',
            'Music': '音楽',
            'Travel': '旅行',
          };
          return translations[interest] || interest;
        }
        return interest;
      }),
      intro: [
        'こんにちは、私は大学生開発者のジュンスです。',
        '余暇には新しい技術を探求し、個人プロジェクトに取り組むことを楽しんでいます。',
      ],
      region: '仁川, 韓国',
    };

    const jaDevProfile = {
      ...devProfile,
      name: '여준수 (ヨ・ジュンス)',
      tagline: '大学生開発者',
      intro: [
        'モダンなウェブアプリケーションの開発に情熱を持っています。',
        '常に新しい技術を学び、探求しています。',
      ],
      region: '仁川, 韓国',
    };

    // Create Chinese translations
    const zhMainProfile = {
      ...mainProfile,
      name: '余俊秀',
      tagline: '大学生开发者',
      interests: mainProfile.interests.map(interest => {
        if (typeof interest === 'string') {
          const translations = {
            'Frontend development': '前端开发',
            'AI research': '人工智能研究',
            'Music': '音乐',
            'Travel': '旅行',
          };
          return translations[interest] || interest;
        }
        return interest;
      }),
      intro: [
        '你好，我是大学生开发者俊秀。',
        '在空闲时间，我喜欢探索新技术并从事个人项目。',
      ],
      region: '仁川，韩国',
    };

    const zhDevProfile = {
      ...devProfile,
      name: '余俊秀',
      tagline: '大学生开发者',
      intro: [
        '对创建现代Web应用充满热情。',
        '始终在学习和探索新技术。',
      ],
      region: '仁川，韩国',
    };

    // Save all profiles to Firebase
    console.log('Saving translated profiles to Firebase...');
    
    // English
    await setDoc(doc(db, 'profiles', 'main_en'), mainProfile);
    console.log('✅ Saved main_en');
    await setDoc(doc(db, 'profiles', 'dev_en'), devProfile);
    console.log('✅ Saved dev_en');
    
    // Korean
    await setDoc(doc(db, 'profiles', 'main_ko'), koMainProfile);
    console.log('✅ Saved main_ko');
    await setDoc(doc(db, 'profiles', 'dev_ko'), koDevProfile);
    console.log('✅ Saved dev_ko');
    
    // Japanese
    await setDoc(doc(db, 'profiles', 'main_ja'), jaMainProfile);
    console.log('✅ Saved main_ja');
    await setDoc(doc(db, 'profiles', 'dev_ja'), jaDevProfile);
    console.log('✅ Saved dev_ja');
    
    // Chinese
    await setDoc(doc(db, 'profiles', 'main_zh'), zhMainProfile);
    console.log('✅ Saved main_zh');
    await setDoc(doc(db, 'profiles', 'dev_zh'), zhDevProfile);
    console.log('✅ Saved dev_zh');

    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
  
  process.exit(0);
}

// Run migration
migrateProfiles();