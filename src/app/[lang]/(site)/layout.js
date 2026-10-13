import ContactLauncher from '@/components/layout/ContactLauncher'
import ContactPopup from '@/components/layout/ContactPopup'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { getDictionary } from '@/i18n'

/**
 * Chrome for every public page. The admin area sits outside this group, so it
 * never inherits the marketing header and footer.
 */
export default async function SiteLayout({ children, params }) {
  const t = getDictionary((await params).lang)

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#continut"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:inline-flex focus:h-12 focus:items-center focus:rounded-[3px] focus:bg-ink focus:px-6 focus:text-sm focus:text-ivory"
      >
        {t.layout.skipToContent}
      </a>

      <Header t={t} />

      <main id="continut" className="flex-1 pt-20">
        {children}
      </main>

      <Footer t={t} />

      <ContactLauncher />
      <ContactPopup />
    </div>
  )
}
