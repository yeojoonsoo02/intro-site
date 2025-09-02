import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Profile {
  name: string;
  tagline: string;
  email: string;
  photo: string;
  interests: (string | { label: string; url?: string })[];
  intro: string[];
  region: string;
}

async function migrateProfiles() {
  try {
    // Fetch existing profiles
    console.log('Fetching existing profiles...');
    const mainDoc = await getDoc(doc(db, 'profiles', 'main'));
    const devDoc = await getDoc(doc(db, 'profiles', 'dev'));
    
    let mainProfile: Profile | null = null;
    let devProfile: Profile | null = null;

    if (mainDoc.exists()) {
      mainProfile = mainDoc.data() as Profile;
      console.log('Found main profile:', mainProfile);
    }

    if (devDoc.exists()) {
      devProfile = devDoc.data() as Profile;
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

    // Create translated versions
    const translations = {
      ko: {
        main: {
          ...mainProfile,
          name: '여준수',
          tagline: '대학생 개발자',
          interests: translateInterests(mainProfile.interests, 'ko'),
          intro: [
            '안녕하세요, 저는 대학생 개발자 준수입니다.',
            '여가 시간에는 새로운 기술을 탐구하고 개인 프로젝트를 진행하는 것을 좋아합니다.',
          ],
          region: '인천, 대한민국',
        },
        dev: {
          ...devProfile,
          name: '여준수',
          tagline: '대학생 개발자',
          interests: translateInterests(devProfile.interests, 'ko', true),
          intro: [
            '현대적인 웹 애플리케이션 개발에 열정을 가지고 있습니다.',
            '항상 새로운 기술을 배우고 탐구하고 있습니다.',
          ],
          region: '인천, 대한민국',
        },
      },
      ja: {
        main: {
          ...mainProfile,
          name: '여준수 (ヨ・ジュンス)',
          tagline: '大学生開発者',
          interests: translateInterests(mainProfile.interests, 'ja'),
          intro: [
            'こんにちは、私は大学生開発者のジュンスです。',
            '余暇には新しい技術を探求し、個人プロジェクトに取り組むことを楽しんでいます。',
          ],
          region: '仁川, 韓国',
        },
        dev: {
          ...devProfile,
          name: '여준수 (ヨ・ジュンス)',
          tagline: '大学生開発者',
          interests: translateInterests(devProfile.interests, 'ja', true),
          intro: [
            'モダンなウェブアプリケーションの開発に情熱を持っています。',
            '常に新しい技術を学び、探求しています。',
          ],
          region: '仁川, 韓国',
        },
      },
      zh: {
        main: {
          ...mainProfile,
          name: '余俊秀',
          tagline: '大学生开发者',
          interests: translateInterests(mainProfile.interests, 'zh'),
          intro: [
            '你好，我是大学生开发者俊秀。',
            '在空闲时间，我喜欢探索新技术并从事个人项目。',
          ],
          region: '仁川，韩国',
        },
        dev: {
          ...devProfile,
          name: '余俊秀',
          tagline: '大学生开发者',
          interests: translateInterests(devProfile.interests, 'zh', true),
          intro: [
            '对创建现代Web应用充满热情。',
            '始终在学习和探索新技术。',
          ],
          region: '仁川，韩国',
        },
      },
      en: {
        main: mainProfile,
        dev: devProfile,
      },
    };

    // Save all profiles to Firebase
    console.log('Saving translated profiles to Firebase...');
    
    for (const [lang, profiles] of Object.entries(translations)) {
      console.log(`Saving ${lang} profiles...`);
      
      // Save main profile
      await setDoc(doc(db, 'profiles', `main_${lang}`), profiles.main);
      console.log(`✅ Saved main_${lang}`);
      
      // Save dev profile
      await setDoc(doc(db, 'profiles', `dev_${lang}`), profiles.dev);
      console.log(`✅ Saved dev_${lang}`);
    }

    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

function translateInterests(
  interests: (string | { label: string; url?: string })[],
  lang: string,
  isDev: boolean = false
): (string | { label: string; url?: string })[] {
  const translations: Record<string, Record<string, string>> = {
    ko: {
      'Frontend development': '프론트엔드 개발',
      'AI research': 'AI 연구',
      'Music': '음악',
      'Travel': '여행',
      'React': 'React',
      'Next.js': 'Next.js',
      'TypeScript': 'TypeScript',
      'Node.js': 'Node.js',
      'Python': 'Python',
    },
    ja: {
      'Frontend development': 'フロントエンド開発',
      'AI research': 'AI研究',
      'Music': '音楽',
      'Travel': '旅行',
      'React': 'React',
      'Next.js': 'Next.js',
      'TypeScript': 'TypeScript',
      'Node.js': 'Node.js',
      'Python': 'Python',
    },
    zh: {
      'Frontend development': '前端开发',
      'AI research': '人工智能研究',
      'Music': '音乐',
      'Travel': '旅行',
      'React': 'React',
      'Next.js': 'Next.js',
      'TypeScript': 'TypeScript',
      'Node.js': 'Node.js',
      'Python': 'Python',
    },
  };

  return interests.map(interest => {
    if (typeof interest === 'string') {
      return translations[lang]?.[interest] || interest;
    }
    return {
      ...interest,
      label: translations[lang]?.[interest.label] || interest.label,
    };
  });
}

// Run migration
migrateProfiles().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});