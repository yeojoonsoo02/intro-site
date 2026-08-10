'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import TopBarMenu from './TopBarMenu'
import ChatInviteBanner from './ChatInviteBanner'

const PromptBox = dynamic(() => import('@/features/prompt/PromptBox'), {
  ssr: false,
})

export default function TopBar(): JSX.Element {
  const [promptOpen, setPromptOpen] = useState(false)

  const openPrompt = (): void => setPromptOpen(true)
  const closePrompt = (): void => setPromptOpen(false)

  // 페이지 어디서든 챗을 열 수 있게 하는 통로. 챗 상태는 여기 지역 상태라
  // 다른 트리(랜딩 등)에서 직접 만질 수 없어 이벤트로 연결한다.
  useEffect(() => {
    const handler = (): void => setPromptOpen(true)
    window.addEventListener('open-prompt', handler)
    return () => window.removeEventListener('open-prompt', handler)
  }, [])

  return (
    <>
      <TopBarMenu onOpenPrompt={openPrompt} />
      <ChatInviteBanner hidden={promptOpen} onOpen={openPrompt} />
      <PromptBox open={promptOpen} onClose={closePrompt} />
    </>
  )
}
