/**
 * Zilele rezervate se țin ca dată „doar zi": miezul nopții UTC al zilei din
 * calendarul din Chișinău. Așa o zi aleasă în formular sau în panou e aceeași
 * oriunde rulează serverul.
 */
export const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function parseDay(value) {
  if (typeof value !== 'string' || !DAY_PATTERN.test(value)) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  // Respinge 2026-02-31, pe care Date l-ar muta tăcut în martie.
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date
}
