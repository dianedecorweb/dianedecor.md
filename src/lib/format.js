const EVENT_DATE = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Chisinau' }

const dateFormatters = {
  ro: new Intl.DateTimeFormat('ro-MD', EVENT_DATE),
  ru: new Intl.DateTimeFormat('ru-RU', EVENT_DATE),
}

const dateTimeFormatter = new Intl.DateTimeFormat('ro-MD', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Chisinau',
})

// 'MDL' spelled out: the ro-MD currency symbol renders as a bare 'L', which reads badly.
const prices = {
  ro: { from: 'de la', formatter: new Intl.NumberFormat('ro-MD', { maximumFractionDigits: 0 }) },
  ru: { from: 'от', formatter: new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }) },
}

/** "14 iunie 2025" / "14 июня 2025 г." — used for event dates across the portfolio. */
export function formatEventDate(value, lang = 'ro') {
  if (!value) return null
  return (dateFormatters[lang] ?? dateFormatters.ro).format(new Date(value))
}

/** "24.08.2026, 17:30" — used in the admin inbox. */
export function formatDateTime(value) {
  if (!value) return null
  return dateTimeFormatter.format(new Date(value))
}

/** "de la 15.000 MDL" / "от 15 000 MDL" — services quote a starting price, not a fixed one. */
export function formatPriceFrom(value, lang = 'ro') {
  if (value === null || value === undefined) return null
  const { from, formatter } = prices[lang] ?? prices.ro
  return `${from} ${formatter.format(value)} MDL`
}

/** Value for a <time datetime> attribute. */
export function toIsoDate(value) {
  if (!value) return undefined
  return new Date(value).toISOString()
}

/** Splits DB text stored with blank lines between paragraphs. */
export function toParagraphs(text) {
  if (!text) return []
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
