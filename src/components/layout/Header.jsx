import { Phone } from 'lucide-react'

import Logo from '@/components/brand/Logo'
import Container from '@/components/layout/Container'
import LanguageSwitch from '@/components/layout/LanguageSwitch'
import MobileNav from '@/components/layout/MobileNav'
import NavLinks from '@/components/layout/NavLinks'
import Button from '@/components/ui/Button'
import { Link } from '@/i18n/client'
import { siteConfig } from '@/lib/site-config'

/**
 * Solid on every page; transparent over the hero on the homepage until the page
 * is scrolled past 80px. Both states are driven from `globals.css` by the
 * attributes `ScrollState` writes onto <html>.
 */
export default function Header({ t }) {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 h-20 border-b transition-colors duration-200 ease-out">
      <Container className="flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center"
          aria-label={t.layout.homeAria}
        >
          <Logo variant="inherit" />
        </Link>

        <nav aria-label={t.layout.mainNav} className="site-nav hidden lg:block">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <a
            href={siteConfig.phoneHref}
            className="hidden min-h-11 items-center gap-2 text-sm tracking-[0.02em] transition-colors duration-200 ease-out hover:text-accent-deep xl:inline-flex"
          >
            <Phone size={16} aria-hidden="true" />
            {siteConfig.phone}
          </a>
          <LanguageSwitch />
          <Button href="/contact" variant="primary" className="header-cta">
            {t.layout.requestOffer}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitch />
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
