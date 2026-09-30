import ContactLauncher from '@/components/layout/ContactLauncher'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

/**
 * Chrome for every public page. The admin area sits outside this group, so it
 * never inherits the marketing header and footer.
 */
export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#continut"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:inline-flex focus:h-12 focus:items-center focus:rounded-[3px] focus:bg-ink focus:px-6 focus:text-sm focus:text-ivory"
      >
        Sari la conținut
      </a>

      <Header />

      <main id="continut" className="flex-1 pt-20">
        {children}
      </main>

      <Footer />

      <ContactLauncher />
    </div>
  )
}
