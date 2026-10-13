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

/**
 * Doar literele rusești. Pe paginile /ru stau primele în lista de fonturi
 * (vezi `:lang(ru)` în globals.css): chirilica vine de aici, cifrele și literele
 * latine din fișierele de mai sus. Fără fonturi de rezervă proprii, altfel un
 * Times New Roman local ar prinde literele latine înaintea Cormorantului.
 * Nepreîncărcate: o pagină românească nu le cere niciodată.
 */
export const cormorantCyrillic = localFont({
  src: [
    { path: '../fonts/cormorant-400-cyr.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cormorant-600-cyr.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-cormorant-cyr',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: [],
})

export const interCyrillic = localFont({
  src: [
    { path: '../fonts/inter-400-cyr.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-500-cyr.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-inter-cyr',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: [],
})

/** Pentru paginile rusești: și variabilele chirilice. */
export const fontClassesRu = `${fontClasses} ${cormorantCyrillic.variable} ${interCyrillic.variable}`
