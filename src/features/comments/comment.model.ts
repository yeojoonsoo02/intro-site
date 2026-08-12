export type Comment = {
  id: string;
  text: string;
  author?: string;
  // 서버 API가 밀리초로 내려준다(Firestore Timestamp는 JSON으로 나가지 못한다).
  // 낙관적 임시 댓글은 Date.now()를 쓴다.
  createdAt: number | null;
};
