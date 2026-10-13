'use client'

import { Link, useDictionary, usePagePath } from '@/i18n/client'

/**
 * The desktop navigation list.
 *
 * It is a client component only because Next.js exposes no server-side pathname
 * API, and `aria-current` has to be a real attribute for screen readers. Client
 * components are still server-rendered, so the attribute is present in the HTML
 * that arrives — this is not a hydration-only state. `Header` itself stays a
 * server component.
 */
export default function NavLinks() {
  const { nav } = useDictionary()
  const pathname = usePagePath()

  return (
    <ul className="flex items-center gap-8">
      {nav.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              data-nav={item.href}
              aria-current={isActive ? 'page' : undefined}
              className="inline-flex min-h-11 items-center text-sm tracking-[0.02em] transition-colors duration-200 ease-out hover:text-accent-deep aria-[current=page]:underline aria-[current=page]:underline-offset-[6px]"
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
