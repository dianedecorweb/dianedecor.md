/**
 * Limbile site-ului. Româna stă la rădăcină (/servicii), rusa sub /ru
 * (/ru/servicii). Intern ambele trec prin segmentul [lang]: next.config
 * rescrie adresele fără prefix spre /ro, fără să schimbe ce vede vizitatorul.
 */
export const LOCALES = ['ro', 'ru']

export function isLocale(value) {
  return LOCALES.includes(value)
}

/** Adresa publică a unei căi într-o limbă: `/servicii` sau `/ru/servicii`. */
export function localePath(lang, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (lang !== 'ru') return clean
  return clean === '/' ? '/ru' : `/ru${clean}`
}

/**
 * Calea fără prefixul de limbă, ca să construiești aceeași pagină în cealaltă
 * limbă. Tratează și /ro, forma internă a paginilor românești după rescriere.
 */
export function stripLocale(pathname = '/') {
  const match = /^\/(?:ro|ru)(\/.*)?$/.exec(pathname)
  return match ? match[1] || '/' : pathname
}

/** Canonicul și variantele hreflang ale unei pagini, pentru `metadata.alternates`. */
export function alternatesFor(lang, path) {
  return {
    canonical: localePath(lang, path),
    languages: {
      ro: localePath('ro', path),
      ru: localePath('ru', path),
      'x-default': localePath('ro', path),
    },
  }
}
