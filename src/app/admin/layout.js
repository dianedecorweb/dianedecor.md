import AdminSidebar from '@/components/admin/AdminSidebar'
import { fontClasses } from '@/app/fonts'
import { isAuthenticated } from '@/lib/auth'
import { getSiteUrl, siteConfig } from '@/lib/site-config'

import '../globals.css'

/**
 * Rădăcina panoului. Panoul e doar în română și are propriul <html>, separat de
 * site, pentru că site-ul își alege limba din adresă (/ru/...).
 */
export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: 'Administrare', template: `%s | ${siteConfig.name}` },
  robots: { index: false, follow: false },
}

export const viewport = {
  themeColor: '#FAF7F2',
  colorScheme: 'light',
}

export default async function AdminLayout({ children }) {
  // Cine nu e autentificat vede doar formularul de login. Meniul lateral spune
  // altfel unui străin cum e împărțit panoul și ce rute există.
  const authenticated = await isAuthenticated()

  return (
    <html lang="ro" className={fontClasses}>
      <body>
        <div className="flex min-h-dvh flex-col bg-ivory lg:flex-row">
          {authenticated ? <AdminSidebar /> : null}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
