/**
 * Stările unui mesaj de contact, într-un singur loc.
 *
 * Stăteau exportate din `MessageRow.jsx`, care e marcat `'use client'`. Pagina
 * de administrare e component de server și le importa de acolo: peste granița
 * server/client, exporturile unui modul de client devin referințe, nu obiectul
 * real, așa că `STATUS_LABELS[value]` ieșea `undefined` și filtrele se afișau
 * fără nume — doar „(33)", „(0)". Modulul ăsta nu are directivă, deci merge
 * în ambele lumi.
 */

export const MESSAGE_STATUSES = ['NEW', 'READ', 'CONTACTED', 'ARCHIVED']

export const STATUS_LABELS = {
  NEW: 'Nou',
  READ: 'Citit',
  CONTACTED: 'Contactat',
  ARCHIVED: 'Arhivat',
}

/** Ce înseamnă fiecare stare, pentru cine deschide panoul prima dată. */
export const STATUS_HINTS = {
  NEW: 'cereri necitite',
  READ: 'citite, dar fără răspuns',
  CONTACTED: 'clientul a fost sunat',
  ARCHIVED: 'închise',
}

export function isMessageStatus(value) {
  return MESSAGE_STATUSES.includes(value)
}

/** De unde a pornit cererea, pe scurt, pentru eticheta din panou. */
export const SOURCE_LABELS = {
  fereastra: 'din fereastra de la intrare',
  buton: 'din butonul flotant',
  chirie: 'din catalogul de chirie',
  site: 'din site',
}
