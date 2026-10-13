'use client'

import { Link } from '@/i18n/client'

/**
 * Trimite contorului o apăsare pe telefon sau Instagram. `sendBeacon` pleacă
 * chiar dacă pagina e părăsită imediat — exact ce se întâmplă la un apel.
 * Browserele automate (verificări, audituri) nu se numără.
 */
function track(channel, source) {
  if (!source || navigator.webdriver || typeof navigator.sendBeacon !== 'function') return
  const body = new Blob([JSON.stringify({ channel, source })], { type: 'application/json' })
  navigator.sendBeacon('/api/track', body)
}

/**
 * A contact channel as a link: client-side for our own pages, a new tab for
 * Instagram. `source` says where the link sits — the entry popup or the floating
 * button — so the quote form and the click counter can tell them apart.
 */
export default function ChannelLink({ channel, source, className, onClick, children }) {
  if (channel.internal) {
    const href = source ? `${channel.href}?din=${source}` : channel.href
    return (
      <Link href={href} onClick={onClick} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a
      href={channel.href}
      onClick={(event) => {
        track(channel.key, source)
        onClick?.(event)
      }}
      className={className}
      {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
