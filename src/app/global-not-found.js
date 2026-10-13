import Link from 'next/link'

import { fontClasses } from '@/app/fonts'

import './globals.css'

/**
 * Pentru adresele care nu ajung în nicio parte a site-ului (de pildă o cale
 * greșită sub /admin). Paginile publice au propriul 404, în limba lor; ăsta e
 * plasa de siguranță, deci vorbește ambele limbi.
 */
export const metadata = {
  title: 'Pagina nu a fost găsită · Страница не найдена',
  robots: { index: false, follow: true },
}

export default function GlobalNotFound() {
  return (
    <html lang="ro" className={fontClasses}>
      <body>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-ivory px-6 text-center">
          <p className="eyebrow text-accent">404</p>
          <h1 className="text-4xl">Pagina nu a fost găsită</h1>
          <p lang="ru" className="text-lg text-ink-soft">
            Страница не найдена
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="inline-flex h-12 items-center rounded-[3px] bg-ink px-6 text-sm font-medium text-ivory">
              Pagina principală
            </Link>
            <Link href="/ru" lang="ru" className="inline-flex h-12 items-center rounded-[3px] border border-ink px-6 text-sm font-medium text-ink">
              Главная страница
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
