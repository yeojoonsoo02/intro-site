'use client'

import { useState } from 'react'
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

  return (
    <>
      <TopBarMenu onOpenPrompt={openPrompt} />
      <ChatInviteBanner hidden={promptOpen} onOpen={openPrompt} />
      <PromptBox open={promptOpen} onClose={closePrompt} />
    </>
  )
}
