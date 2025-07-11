"use client";
import { useRouter } from 'next/navigation';
import PromptBox from '@/features/prompt/PromptBox';

export default function ChatPage() {
  const router = useRouter();
  return <PromptBox open={true} onClose={() => router.back()} />;
}
