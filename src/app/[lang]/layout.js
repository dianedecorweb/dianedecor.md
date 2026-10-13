import { notFound } from 'next/navigation'
import { preload } from 'react-dom'

import ScrollState from '@/components/layout/ScrollState'
import { fontClasses } from '@/app/fonts'
import { getDictionary } from '@/i18n'
import { LocaleProvider } from '@/i18n/client'
import { LOCALES, isLocale } from '@/i18n/config'
import { getSiteUrl, siteConfig } from '@/lib/site-config'

import '../globals.css'

/**
 * Rădăcina site-ului public, câte una pe limbă: `<html lang>` trebuie să spună
 * limba reală a paginii, pentru cititoarele de ecran și pentru Google.
 * Ambele limbi se generează la build.
 */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const { meta } = getDictionary(lang)

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: meta.title, template: `%s | ${siteConfig.name}` },
    description: meta.description,
    applicationName: siteConfig.name,
    // icon.png și apple-icon.png din src/app sunt preluate automat de Next; aici
    // rămân doar mărimile suplimentare pentru Android și pentru ecranul de start.
    icons: {
      icon: [
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    openGraph: {
      type: 'website',
      locale: meta.locale,
      alternateLocale: lang === 'ru' ? ['ro_MD'] : ['ru_MD'],
      siteName: siteConfig.name,
      title: meta.title,
      description: meta.description,
      images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['/images/og-image.jpg'],
    },
  }
}

/** Cele trei greutăți folosite pe orice pagină; Cormorant 600 se cere doar unde apare. */
const CYRILLIC_FONTS = ['inter-400-cyr.woff2', 'inter-500-cyr.woff2', 'cormorant-400-cyr.woff2']

export const viewport = {
  themeColor: '#FAF7F2',
  colorScheme: 'light',
}

export default async function LocaleRootLayout({ children, params }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  // Chirilica vine din fișiere separate (vezi globals.css). Fără preîncărcare
  // ajungeau ultimele, după fonturile latine, și textul rusesc se redesena
  // târziu. Se cer doar pe paginile rusești; cele românești nu le descarcă.
  if (lang === 'ru') {
    for (const file of CYRILLIC_FONTS) {
      preload(`/fonts/${file}`, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
    }
  }

  return (
    <html lang={lang} className={fontClasses}>
      <body>
        <LocaleProvider lang={lang}>
          <ScrollState />
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
