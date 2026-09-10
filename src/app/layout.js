import localFont from 'next/font/local'

import ScrollState from '@/components/layout/ScrollState'
import { getSiteUrl, siteConfig } from '@/lib/site-config'

import './globals.css'

/**
 * Self-hosted and subset to the Romanian character set by
 * `scripts/fetch-fonts.js`. Google's `latin-ext` subset covers every Eastern
 * European language and cost 202 KB of render-blocking font data; these four
 * files total 71 KB.
 */
const cormorant = localFont({
  src: [
    { path: '../fonts/cormorant-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cormorant-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  fallback: ['ui-serif', 'Georgia', 'serif'],
})

const inter = localFont({
  src: [
    { path: '../fonts/inter-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline} în Republica Moldova`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'decor nuntă Chișinău',
    'decor cumetrie',
    'cerere în căsătorie',
    'decor aniversare',
    'cununie în aer liber',
    'baloane cu heliu Chișinău',
    'chirie decor Moldova',
  ],
  alternates: { canonical: '/' },
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
    locale: 'ro_MD',
    url: '/',
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ['/images/og-image.jpg'],
  },
}

export const viewport = {
  themeColor: '#FAF7F2',
  colorScheme: 'light',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <ScrollState />
        {children}
      </body>
    </html>
  )
}
