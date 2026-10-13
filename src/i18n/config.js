/**
 * Limbile site-ului. Româna stă la rădăcină (/servicii), rusa sub /ru
 * (/ru/servicii). Intern ambele trec prin segmentul [lang]: next.config
 * rescrie adresele fără prefix spre /ro, fără să schimbe ce vede vizitatorul.
 */
export const LOCALES = ['ro', 'ru']
export const DEFAULT_LOCALE = 'ro'

export function isLocale(value) {
  return LOCALES.includes(value)
}

/** Adresa publică a unei căi într-o limbă: `/servicii` sau `/ru/servicii`. */
export function localePath(lang, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (lang !== 'ru') return clean
  return clean === '/' ? '/ru' : `/ru${clean}`
}

/** Calea fără prefixul de limbă, ca să construiești aceeași pagină în cealaltă limbă. */
export function stripLocale(pathname = '/') {
  if (pathname === '/ru') return '/'
  if (pathname.startsWith('/ru/')) return pathname.slice(3)
  return pathname
}

/** Limba după adresa din browser, pentru componentele care nu primesc parametri. */
export function localeFromPath(pathname = '/') {
  return pathname === '/ru' || pathname.startsWith('/ru/') ? 'ru' : DEFAULT_LOCALE
}
