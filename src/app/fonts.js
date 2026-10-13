import localFont from 'next/font/local'

/**
 * Self-hosted and subset by `scripts/fetch-fonts.js`. Google's `latin-ext`
 * subset covers every Eastern European language and cost 202 KB of
 * render-blocking font data; these files hold only the glyphs the site uses.
 */
export const cormorant = localFont({
  src: [
    { path: '../fonts/cormorant-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cormorant-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  fallback: ['ui-serif', 'Georgia', 'serif'],
})

export const inter = localFont({
  src: [
    { path: '../fonts/inter-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

/** Clasele care pun variabilele de font pe <html>. */
export const fontClasses = `${cormorant.variable} ${inter.variable}`
