import { siteConfig } from '@/lib/site-config'

/**
 * Manifestul pentru „Adaugă pe ecranul principal" de pe Android și Chrome.
 *
 * `maskable` e o iconiță separată: Android taie iconițele obișnuite în forma
 * lansatorului (cerc, pătrat rotunjit, picătură), iar fără marginea din ea
 * floarea ar rămâne fără petale pe unele telefoane.
 */
export default function manifest() {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: 'ro',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#faf7f2',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
