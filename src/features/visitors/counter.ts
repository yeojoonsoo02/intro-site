import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function incrementVisitCount(callback?: (count: number) => void) {
  const ref = doc(db, 'counters', 'visits');

  try {
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, {
        count: increment(1),
      });
    } else {
      await setDoc(ref, { count: 1 });
    }

    const updated = await getDoc(ref);
    const count = updated.data()?.count ?? 0;
    if (callback) callback(count);
  } catch (err) {
    console.error('👀 방문자 수 업데이트 실패:', err);
    if (callback) callback(0);
  }
}