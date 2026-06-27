import { doc, getDoc, setDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function incrementVisitCount(callback?: (count: number) => void): Promise<void> {
  const ref = doc(db, 'counters', 'visits');

  try {
    // setDoc(merge) + increment 으로 존재 여부 사전 조회 없이 1회 쓰기.
    // - 문서가 없으면 increment(1) 은 count=1 로 생성 → 규칙 create(count==1) 충족
    // - 문서가 있으면 count+1 → 규칙 update(count==resource.count+1) 충족
    // 페이로드 키는 ['count','updatedAt'] 로 한정해 hasOnly 규칙 위반 방지.
    await setDoc(
      ref,
      { count: increment(1), updatedAt: serverTimestamp() },
      { merge: true }
    );

    // 갱신된 값 1회 읽기(기존 2회 → 1회로 감소)
    const updated = await getDoc(ref);
    const count = (updated.data()?.count as number | undefined) ?? 0;
    if (callback) callback(count);
  } catch (err) {
    console.error('👀 방문자 수 업데이트 실패:', err);
    if (callback) callback(0);
  }
}