'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink, Inbox, Images, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import Logo from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

const sections = [
  { label: 'Mesaje', href: '/admin', icon: Inbox },
  { label: 'Portofoliu', href: '/admin/portofoliu', icon: Images },
]

/**
 * Side navigation for the admin area: a fixed column from `lg` up, a panel that
 * slides in from the left below it. Client-side because it owns the open state
 * and because `aria-current` needs the pathname, which Next does not expose on
 * the server.
 */
/** Leagă butonul de panoul pe care îl deschide, pentru cititoarele de ecran. */
const PANEL_ID = 'admin-nav-panel'

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Closing on navigation is derived state, adjusted during render — the same
  // pattern MobileNav uses. Doing it in an effect triggers a cascading render.
  const [previousPathname, setPreviousPathname] = useState(pathname)
  if (pathname !== previousPathname) {
    setPreviousPathname(pathname)
    setIsOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return undefined

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const navigation = (
    <>
      <Link href="/admin" className="inline-flex min-h-11 items-center">
        <Logo variant="dark" className="h-9 sm:h-9" />
      </Link>

      <nav aria-label="Secțiuni de administrare" className="mt-8 flex-1">
        <ul className="flex flex-col gap-1">
          {sections.map((section) => {
            const isActive =
              section.href === '/admin' ? pathname === '/admin' : pathname.startsWith(section.href)

            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex h-11 items-center gap-3 rounded-[3px] px-3 text-sm transition-colors duration-200 ease-out',
                    isActive ? 'bg-ink text-ivory' : 'text-ink-soft hover:bg-line/50 hover:text-ink'
                  )}
                >
                  <section.icon size={18} aria-hidden="true" />
                  {section.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 border-t border-line pt-6 text-sm text-muted transition-colors duration-200 ease-out hover:text-ink"
      >
        <ExternalLink size={16} aria-hidden="true" />
        Vezi site-ul
      </Link>
    </>
  )

  return (
    <>
      {/* Bara mobilă, cu declanșatorul panoului */}
      <div className="flex h-16 items-center justify-between border-b border-line bg-paper px-5 lg:hidden">
        <Link href="/admin" className="inline-flex min-h-11 items-center">
          <Logo variant="dark" className="h-9 sm:h-9" />
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls={PANEL_ID}
          aria-label="Deschide meniul de administrare"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink"
        >
          <Menu size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {/* Coloana fixă, de la lg în sus */}
      {/*
        Lipită de ecran, nu de pagină: cu o sută de evenimente în listă, bara
        pleca la scroll și „Vezi site-ul" ajungea de negăsit fără să cobori
        până la capăt. `h-dvh` ține și legătura de jos mereu vizibilă.
      */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-paper px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:overflow-y-auto">
        {navigation}
      </aside>

      {/* Panoul mobil */}
      {isOpen ? (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Meniu de administrare"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            aria-label="Închide meniul"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/40"
          />

          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-paper px-5 py-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Închide meniul"
              className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center text-ink"
            >
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>

            {navigation}
          </div>
        </div>
      ) : null}
    </>
  )
}
