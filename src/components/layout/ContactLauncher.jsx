'use client'

import { MessageCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import ChannelLink from '@/components/contact/ChannelLink'
import { contactChannels } from '@/components/contact/contactChannels'

/**
 * Floating "Contactele noastre" button. Opens the same three channels as the
 * entry popup, so a visitor who closed the popup can still find them.
 */
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
            {contactChannels.map((channel) => {
              const Icon = channel.icon
              return (
                <li key={channel.key}>
                  <ChannelLink
                    channel={channel}
                    onClick={close}
                    className={`flex min-h-14 w-full items-center gap-3 rounded-md px-4 py-3 text-ink transition-colors duration-200 ease-out ${channel.tone}`}
                  >
                    <Icon size={20} className="shrink-0 text-ink-soft" aria-hidden="true" />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-medium">{channel.label}</span>
                      <span className="truncate text-xs text-ink-soft">{channel.detail}</span>
                    </span>
                  </ChannelLink>
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
