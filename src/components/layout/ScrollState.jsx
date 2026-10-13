'use client'

import { useEffect } from 'react'

import { usePagePath } from '@/i18n/client'

/**
 * The only client-side JavaScript the header needs.
 *
 * It renders nothing. It mirrors two facts onto <html> — whether the page has
 * been scrolled past the header, and which route is open — and `globals.css`
 * styles the header and the active navigation link from there. That keeps
 * Header, its navigation and the footer as pure server components.
 */
export default function ScrollState() {
  // Fără prefixul /ru, ca regulile din globals.css să meargă la fel în ambele limbi.
  const pathname = usePagePath()

  useEffect(() => {
    document.documentElement.dataset.route = pathname

    // Set aria-current on the matching desktop nav link.
    const nav = document.querySelector('.site-nav')
    if (nav) {
      for (const link of nav.querySelectorAll('[data-nav]')) {
        const href = link.dataset.nav
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        if (isActive) {
          link.setAttribute('aria-current', 'page')
        } else {
          link.removeAttribute('aria-current')
        }
      }
    }
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement

    const sync = () => {
      root.dataset.scrolled = String(window.scrollY > 80)
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [])

  return null
}
