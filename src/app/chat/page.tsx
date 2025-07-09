'use client'
import PromptBox from '@/features/prompt/PromptBox'

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PromptBox open={true} />
    </div>
  )
}

