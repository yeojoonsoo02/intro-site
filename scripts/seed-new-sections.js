/**
 * Seed new portfolio sections: Education, Certifications, Testimonials
 * For all 4 languages (ko, en, zh, ja)
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
    education: {
      items: [
        {
          id: 'edu-1',
          school: '광운대학교',
          major: '소프트웨어학부',
          period: '2021.03 ~ 재학 중',
          gpa: '',
          description: '수리논술 전형으로 입학. 자료구조, 객체지향, 시스템 소프트웨어, 기술경영과 마케팅 등 수강.',
          order: 1,
        },
        {
          id: 'edu-2',
          school: '운양고등학교',
          major: '인문계열',
          period: '2018.03 ~ 2020.02',
          gpa: '',
          description: '',
          order: 2,
        },
      ],
    },
    certifications: {
      items: [
        {
          id: 'cert-1',
          name: 'D\'velop 취창업 페스티벌 참가',
          issuer: '광운대학교',
          date: '2025',
          url: '',
          order: 1,
        },
        {
          id: 'cert-2',
          name: '스타트업 최종발표',
          issuer: '광운대학교 기술경영과 마케팅',
          date: '2025',
          url: '',
          order: 2,
        },
      ],
    },
    testimonials: {
      items: [
        {
          id: 'test-1',
          name: '고수학전문학원',
          role: '학원 관리자',
          content: '학생 관리와 시험 출제가 디지털로 바뀌면서 업무가 훨씬 편해졌습니다. 성적 대시보드도 학부모님들이 좋아하세요.',
          order: 1,
        },
        {
          id: 'test-2',
          name: 'StatPodegree',
          role: '대표',
          content: '통계 도구가 연구자들에게 꼭 필요한 기능들만 담겨있어서 반응이 좋습니다. 빠른 개발 속도에 놀랐습니다.',
          order: 2,
        },
      ],
    },
  },
  en: {
    education: {
      items: [
        {
          id: 'edu-1',
          school: 'Kwangwoon University',
          major: 'Dept. of Software',
          period: '2021.03 – Present',
          gpa: '',
          description: 'Admitted through math essay exam. Courses: Data Structures, OOP, System Software, Technology Management.',
          order: 1,
        },
        {
          id: 'edu-2',
          school: 'Unyang High School',
          major: 'Liberal Arts',
          period: '2018.03 – 2020.02',
          gpa: '',
          description: '',
          order: 2,
        },
      ],
    },
    certifications: {
      items: [
        {
          id: 'cert-1',
          name: 'D\'velop Career Festival',
          issuer: 'Kwangwoon University',
          date: '2025',
          url: '',
          order: 1,
        },
        {
          id: 'cert-2',
          name: 'Startup Final Presentation',
          issuer: 'Kwangwoon Univ. - Technology Management',
          date: '2025',
          url: '',
          order: 2,
        },
      ],
    },
    testimonials: {
      items: [
        {
          id: 'test-1',
          name: 'Go Math Academy',
          role: 'Administrator',
          content: 'Digitizing student management and exam creation made our work much easier. Parents love the grade dashboards too.',
          order: 1,
        },
        {
          id: 'test-2',
          name: 'StatPodegree',
          role: 'CEO',
          content: 'The statistics tools include exactly what researchers need. We were impressed by the fast development speed.',
          order: 2,
        },
      ],
    },
  },
  zh: {
    education: {
      items: [
        {
          id: 'edu-1',
          school: '光云大学',
          major: '软件学部',
          period: '2021.03 – 在读',
          gpa: '',
          description: '通过数学论述考试入学。修读数据结构、面向对象、系统软件、技术经营与营销等课程。',
          order: 1,
        },
        {
          id: 'edu-2',
          school: '云阳高中',
          major: '文科',
          period: '2018.03 – 2020.02',
          gpa: '',
          description: '',
          order: 2,
        },
      ],
    },
    certifications: {
      items: [
        {
          id: 'cert-1',
          name: 'D\'velop就业创业节',
          issuer: '光云大学',
          date: '2025',
          url: '',
          order: 1,
        },
        {
          id: 'cert-2',
          name: '创业最终发表',
          issuer: '光云大学 技术经营与营销',
          date: '2025',
          url: '',
          order: 2,
        },
      ],
    },
    testimonials: {
      items: [
        {
          id: 'test-1',
          name: '高数学专门学院',
          role: '管理员',
          content: '学生管理和考试出题数字化后，工作变得方便多了。家长们也很喜欢成绩仪表盘。',
          order: 1,
        },
        {
          id: 'test-2',
          name: 'StatPodegree',
          role: '代表',
          content: '统计工具包含了研究者真正需要的功能，反响很好。开发速度之快令人惊讶。',
          order: 2,
        },
      ],
    },
  },
  ja: {
    education: {
      items: [
        {
          id: 'edu-1',
          school: '光云大学',
          major: 'ソフトウェア学部',
          period: '2021.03 – 在学中',
          gpa: '',
          description: '数理論述で入学。データ構造、OOP、システムソフトウェア、技術経営とマーケティング等を履修。',
          order: 1,
        },
        {
          id: 'edu-2',
          school: 'ウニャン高等学校',
          major: '人文系',
          period: '2018.03 – 2020.02',
          gpa: '',
          description: '',
          order: 2,
        },
      ],
    },
    certifications: {
      items: [
        {
          id: 'cert-1',
          name: 'D\'velop就活フェスティバル',
          issuer: '光云大学',
          date: '2025',
          url: '',
          order: 1,
        },
        {
          id: 'cert-2',
          name: 'スタートアップ最終発表',
          issuer: '光云大学 技術経営とマーケティング',
          date: '2025',
          url: '',
          order: 2,
        },
      ],
    },
    testimonials: {
      items: [
        {
          id: 'test-1',
          name: '高数学専門塾',
          role: '管理者',
          content: '生徒管理と試験作成がデジタル化され、業務がずっと楽になりました。成績ダッシュボードも保護者に好評です。',
          order: 1,
        },
        {
          id: 'test-2',
          name: 'StatPodegree',
          role: '代表',
          content: '統計ツールに研究者が本当に必要な機能だけが揃っていて、反応がとても良いです。開発速度の速さに驚きました。',
          order: 2,
        },
      ],
    },
  },
};

async function main() {
  for (const [lang, sections] of Object.entries(data)) {
    const batch = db.batch();
    batch.set(db.collection('portfolio').doc(`education_${lang}`), sections.education);
    batch.set(db.collection('portfolio').doc(`certifications_${lang}`), sections.certifications);
    batch.set(db.collection('portfolio').doc(`testimonials_${lang}`), sections.testimonials);
    await batch.commit();
    console.log(`[OK] ${lang.toUpperCase()} seeded`);
  }
  console.log('\n✅ All new sections seeded');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
