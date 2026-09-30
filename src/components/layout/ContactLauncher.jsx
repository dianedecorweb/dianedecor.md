'use client'

import Link from 'next/link'
import { MessageCircle, Phone, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { InstagramIcon } from '@/components/brand/SocialIcons'
import { siteConfig } from '@/lib/site-config'

/**
 * Floating "Contactele noastre" button. Opens a short list of ways to reach the
 * studio, ordered by how likely a visitor is to use them: a call first, an
 * Instagram message second, the full quote form last.
 *
 * `ig.me/m/<user>` opens a direct message thread instead of the profile.
 */
const instagramHandle = siteConfig.socials.instagram.replace(/\/+$/, '').split('/').pop()

const channels = [
  {
    key: 'phone',
    href: siteConfig.phoneHref,
    label: 'Sună-ne',
    detail: siteConfig.phone,
    icon: Phone,
    tone: 'bg-[#e9f0e5] hover:bg-[#dde8d8]',
  },
  {
    key: 'instagram',
    href: `https://ig.me/m/${instagramHandle}`,
    label: 'Scrie-ne în Instagram',
    detail: `@${instagramHandle}`,
    icon: InstagramIcon,
    tone: 'bg-[#f6e7ec] hover:bg-[#f0dae2]',
    external: true,
  },
  {
    key: 'offer',
    href: '/contact',
    label: 'Cere o ofertă',
    detail: 'Formular, răspundem în aceeași zi',
    icon: Send,
    tone: 'bg-[#f3ede4] hover:bg-[#ebe2d6]',
    internal: true,
  },
]

export default function ContactLauncher() {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)
  const toggleRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      toggleRef.current?.focus()
    }
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isOpen])

  const close = () => setIsOpen(false)

  return (
    <div
      ref={rootRef}
      className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
    >
      {isOpen ? (
        <div
          id="contact-launcher-panel"
          role="dialog"
          aria-label="Contactele noastre"
          className="w-[min(20rem,calc(100vw-2rem))] rounded-md border border-line bg-paper p-3 shadow-[0_12px_32px_-12px_rgba(30,27,24,0.28)] motion-safe:animate-[launcher-in_180ms_ease-out]"
        >
          <p className="px-1 pt-1 pb-3 text-xs tracking-[0.14em] text-muted uppercase">
            Contactele noastre
          </p>

          <ul className="flex flex-col gap-2">
            {channels.map((channel) => {
              const Icon = channel.icon
              const className = `flex min-h-14 w-full items-center gap-3 rounded-md px-4 py-3 text-ink transition-colors duration-200 ease-out ${channel.tone}`
              const content = (
                <>
                  <Icon size={20} className="shrink-0 text-ink-soft" aria-hidden="true" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{channel.label}</span>
                    <span className="truncate text-xs text-ink-soft">{channel.detail}</span>
                  </span>
                </>
              )

              return (
                <li key={channel.key}>
                  {channel.internal ? (
                    <Link href={channel.href} onClick={close} className={className}>
                      {content}
                    </Link>
                  ) : (
                    <a
                      href={channel.href}
                      onClick={close}
                      className={className}
                      {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {content}
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <button
        ref={toggleRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="contact-launcher-panel"
        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-paper px-5 text-sm font-medium text-ink shadow-[0_8px_24px_-10px_rgba(30,27,24,0.35)] transition-colors duration-200 ease-out hover:bg-ivory"
      >
        {isOpen ? (
          <X size={18} aria-hidden="true" />
        ) : (
          <MessageCircle size={18} aria-hidden="true" />
        )}
        {isOpen ? 'Închide' : 'Contactele noastre'}
      </button>
    </div>
  )
}
