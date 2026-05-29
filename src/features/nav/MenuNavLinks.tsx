'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface MenuNavLinksProps {
  onNavigate: () => void
  onPromptClick: () => void
}

const ITEM_CLASS = 'w-full text-left px-4 py-2.5 transition-colors hover:opacity-70 block'

export default function MenuNavLinks({
  onNavigate,
  onPromptClick,
}: MenuNavLinksProps): JSX.Element {
  const { t } = useTranslation()
  const links: Array<{ href: string; label: string }> = [
    { href: '/about', label: t('about') },
    { href: '/journey', label: t('journey') },
    { href: '/portfolio', label: t('portfolio') },
  ]

  return (
    <div className="py-1">
      {links.map((link) => (
        <Link key={link.href} href={link.href} onClick={onNavigate} className={ITEM_CLASS}>
          {link.label}
        </Link>
      ))}
      <button
        onClick={onPromptClick}
        className="w-full text-left px-4 py-2.5 transition-colors hover:opacity-70"
      >
        {t('prompt')}
      </button>
    </div>
  )
}
