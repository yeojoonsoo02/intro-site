/**
 * Fix timeline data:
 * - tl-11: Remove "D'velop 취창업 페스티벌 참가" (false info)
 * - tl-12: Remove "펫포레스트 미팅"
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

const fixes = {
  ko: {
    'tl-11': { description: '자료구조, 객체지향, 시스템 소프트웨어, 기술경영과 마케팅 등 전공 수업을 들으며 스타트업 최종발표 참가.' },
    'tl-12': { description: '똑똑집단 연합 동아리 활동, 고수학전문학원 시스템 운영, 식단하조·AI써보조·피크닉가조 등 다양한 조모임 참여. 학교와 사업을 병행하며 새로운 경험을 계속 넓히는 중.' },
  },
  en: {
    'tl-11': { description: 'Took courses in Data Structures, OOP, System Software, and Technology Management. Participated in startup finals.' },
    'tl-12': { description: 'Active in Ttokttok Jipdan club, managing GoPS academy system, and participating in various group projects. Continuing to expand experiences while balancing school and business.' },
  },
  zh: {
    'tl-11': { description: '学习数据结构、面向对象、系统软件、技术经营与营销等专业课程。参加创业最终发表。' },
    'tl-12': { description: '聪明集团联合社团活动、高数学学院系统运营、饮食管理·AI体验·野餐等各种小组参与。边上学边创业，持续拓展新的经验。' },
  },
  ja: {
    'tl-11': { description: 'データ構造、OOP、システムソフトウェア、技術経営とマーケティング等を履修。スタートアップ最終発表に参加。' },
    'tl-12': { description: 'トクトクジプタン連合サークル活動、高数学塾システム運営、食事管理・AI体験・ピクニックなど様々なグループに参加。学業と事業を両立しながら新しい経験を広げている。' },
  },
};

async function main() {
  for (const [lang, itemFixes] of Object.entries(fixes)) {
    const docRef = db.collection('portfolio').doc(`timeline_${lang}`);
    const doc = await docRef.get();
    if (!doc.exists) { console.log(`[SKIP] timeline_${lang} not found`); continue; }
    const data = doc.data();
    const items = data.items.map((item) => {
      if (itemFixes[item.id]) {
        return { ...item, ...itemFixes[item.id] };
      }
      return item;
    });
    await docRef.set({ items });
    console.log(`[OK] timeline_${lang} updated`);
  }
  console.log('\n✅ Timeline fixes applied');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
