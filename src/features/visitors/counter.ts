// 방문자 수는 서버 API(/api/visits)를 통해 센다.
// 브라우저가 Firestore에 직접 쓰던 구조는 googleapis가 차단된 망에서 동작하지 않았고,
// 서버 쪽 쿠키로 중복 집계를 걸러 새로고침에 부풀지 않는다.
export async function incrementVisitCount(callback?: (count: number) => void): Promise<void> {
  try {
    const res = await fetch('/api/visits', { method: 'POST' });
    if (!res.ok) throw new Error(`Visits API ${res.status}`);
    const data = (await res.json()) as { count?: number };
    if (callback) callback(typeof data.count === 'number' ? data.count : 0);
  } catch (err) {
    console.error('👀 방문자 수 업데이트 실패:', err);
    if (callback) callback(0);
  }
}
