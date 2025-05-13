import CommentSection from '@/features/comments/CommentSection';

export default function Home() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">💬 여준수의 댓글 공간</h1>
      <CommentSection />
    </main>
  );
}