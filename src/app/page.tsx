import CommentSection from '@/features/comments/CommentSection';
import VisitorCount from '@/features/visitors/VisitorCount';
import IntroCard from '@/features/intro/IntroCard';

export default function Home() {
  return (
    <main className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-2">👋 여준수의 인트로 페이지</h1>
      <VisitorCount />
      <IntroCard />
      <div className="mt-8 text-left">
        <h2 className="text-2xl font-bold mb-4">💬 여준수의 댓글 공간</h2>
        <CommentSection />
      </div>
    </main>
  );
}