import { notFound } from 'next/navigation'

import ScrollState from '@/components/layout/ScrollState'
import { fontClasses } from '@/app/fonts'
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

const META = {
  ro: {
    title: `${siteConfig.name} — ${siteConfig.tagline} în Republica Moldova`,
    description: siteConfig.description,
    locale: 'ro_MD',
  },
  ru: {
    title: `${siteConfig.name} — студия декора мероприятий в Молдове`,
    description:
      'Студия декора мероприятий в Республике Молдова. Свадьбы, крестины, предложения руки и сердца, дни рождения, выездные церемонии, гелиевые шары и аренда декора.',
    locale: 'ru_MD',
  },
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const meta = META[lang] ?? META.ro

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

export const viewport = {
  themeColor: '#FAF7F2',
  colorScheme: 'light',
}

export default async function LocaleRootLayout({ children, params }) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return (
    <html lang={lang} className={fontClasses}>
      <body>
        <ScrollState />
        {children}
      </body>
    </html>
  )
}
