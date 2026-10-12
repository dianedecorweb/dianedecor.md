'use client'

import { Heart, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import ChannelLink from '@/components/contact/ChannelLink'
import { contactChannels } from '@/components/contact/contactChannels'

const SEEN_KEY = 'dd-contact-popup-seen'
const OPEN_DELAY_MS = 1200

// sessionStorage can throw (private mode, blocked site data); the popup then
// simply shows, which is the safe side to fail on.
function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // nothing to remember it in
  }
}

/**
 * Greets a visitor once per visit with the three ways to reach the studio.
 *
 * Built on the native <dialog>: `showModal()` gives the top layer, the Esc key,
 * focus kept inside and the page behind made inert, with no code of our own.
 * It opens a moment after load so the page paints first, and not at all on
 * /contact, where the visitor is already at the form.
 */
export default function ContactPopup() {
  const dialogRef = useRef(null)
  const pathname = usePathname()

  useEffect(() => {
    // Automated browsers (tests, audits) never need greeting.
    if (pathname.startsWith('/contact') || alreadySeen() || navigator.webdriver) return undefined

    const timer = setTimeout(() => {
      dialogRef.current?.showModal()
      markSeen()
    }, OPEN_DELAY_MS)

    return () => clearTimeout(timer)
  }, [pathname])

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="contact-popup-title"
      // A click that lands on the dialog itself, not its content, is on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      className="contact-popup m-auto max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-md bg-paper p-0 text-ink shadow-[0_24px_64px_-24px_rgba(30,27,24,0.45)]"
    >
      <div className="relative px-6 pt-10 pb-7 text-center sm:px-8">
        <button
          type="button"
          onClick={close}
          aria-label="Închide"
          className="absolute top-2 right-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 ease-out hover:bg-ivory hover:text-ink"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <h2 id="contact-popup-title" className="font-display text-[1.875rem] leading-tight">
          Decor pentru evenimente în Moldova
        </h2>
        <Heart
          size={18}
          aria-hidden="true"
          className="mx-auto mt-3 fill-pastel-rose-deep text-[#c98fa2]"
        />
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Nunți, cumetrii, cereri în căsătorie și aniversări, în Chișinău și în toată țara.
          Spune-ne data și îți facem o propunere.
        </p>

        <ul className="mt-6 flex flex-col gap-3">
          {contactChannels.map((channel) => {
            const Icon = channel.icon
            return (
              <li key={channel.key}>
                <ChannelLink
                  channel={channel}
                  onClick={close}
                  className={`flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full px-6 text-[0.95rem] font-medium text-ink transition-colors duration-200 ease-out ${channel.tone}`}
                >
                  <Icon size={19} aria-hidden="true" className="shrink-0 text-ink-soft" />
                  {channel.shortLabel ?? channel.label}
                </ChannelLink>
              </li>
            )
          })}
        </ul>
      </div>
    </dialog>
  )
}
