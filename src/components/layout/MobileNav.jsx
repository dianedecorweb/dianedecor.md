'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'

import { FacebookIcon, InstagramIcon } from '@/components/brand/SocialIcons'
import Button from '@/components/ui/Button'
import { navigation, siteConfig } from '@/lib/site-config'
import { cn } from '@/lib/utils'

const FOCUSABLE = 'a[href], button:not([disabled])'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef(null)
  const triggerRef = useRef(null)

  const [prevPathname, setPrevPathname] = useState(pathname)

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const panel = panelRef.current
    // Pe primul buton, focusul lăsa un contur vizibil după atingere pe telefon.
    // Containerul e și varianta corectă pentru un dialog: cititorul de ecran
    // anunță tot panoul, nu doar butonul de închidere.
    panel?.focus({ preventScroll: true })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        // Doar aici: cine a închis cu Esc navighează cu tastatura și are nevoie
        // să vadă unde a ajuns focusul.
        triggerRef.current?.focus()
        return
      }

      if (event.key !== 'Tab' || !panel) return

      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    // Tapping the phone number leaves the site. Coming back can restore the page
    // from the back/forward cache with the panel still open and scroll still
    // locked, which reads as a frozen site.
    const handlePageShow = () => setIsOpen(false)

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('pageshow', handlePageShow)
      body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const panel = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Meniu"
      className="fixed inset-0 z-[60] lg:hidden"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="flex h-full w-full flex-col bg-ivory px-6 pt-5 pb-8 outline-none"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Închide meniul"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink"
          >
            <X size={24} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Navigare principală" className="mt-6 flex-1">
          <ul className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'font-display block py-3 text-3xl leading-none',
                      isActive ? 'text-accent-deep' : 'text-ink'
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-5 border-t border-line pt-6">
          <Button href="/contact" variant="primary" fullWidth onClick={() => setIsOpen(false)}>
            Cere o ofertă
          </Button>

          <a
            href={siteConfig.phoneHref}
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-3 text-ink transition-colors duration-200 ease-out hover:text-accent-deep"
          >
            <Phone size={18} aria-hidden="true" />
            {siteConfig.phone}
          </a>

          <div className="flex items-center gap-4">
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors duration-200 ease-out hover:text-accent-deep"
            >
              <InstagramIcon size={22} />
            </a>
            <a
              href={siteConfig.socials.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors duration-200 ease-out hover:text-accent-deep"
            >
              <FacebookIcon size={22} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-label="Deschide meniul"
        className="-mr-2 inline-flex h-11 w-11 items-center justify-center lg:hidden"
      >
        <Menu size={24} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/*
        Portalled into <body>: the header sets `backdrop-filter`, and an element
        carrying that property becomes the containing block for `position: fixed`
        descendants. Rendered in place, the panel sized itself against the 80px
        header instead of the viewport — it left a strip uncovered on the left and
        let the page show through the links.

        No mounted flag is needed: `isOpen` only becomes true through a click, so
        the portal never runs during server rendering.
      */}
      {isOpen ? createPortal(panel, document.body) : null}
    </>
  )
}
