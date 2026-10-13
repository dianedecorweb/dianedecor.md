import { z } from 'zod'

import { ruLines, ruText } from '@/lib/ru-fields'

/**
 * One schema for editing a service, shared by `ServiceForm` and the admin route.
 *
 * The slug and the icon are not here: the slug is the page address and the link
 * from the quote form, the icon is picked in code. Services are edited, not
 * created or deleted from the panel — each one is tied to an event type in the
 * contact form.
 */

const IMAGE_PATTERN = /^(\/images\/[\w\-./]+\.(jpe?g|png|webp|avif)|https:\/\/[^\s]+)$/i

/** „Ce include" arrives as one item per line, so empty lines are dropped. */
const lines = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? value.split('\n').map((line) => line.trim()).filter(Boolean)
      : value,
  z
    .array(z.string().min(3, 'Fiecare rând trebuie să aibă cel puțin 3 caractere.').max(160, 'Un rând poate avea maximum 160 de caractere.'))
    .min(1, 'Scrie cel puțin un lucru inclus.')
    .max(12, 'Cel mult 12 rânduri.')
)

export const serviceSchema = z.object({
  title: z
    .string({ error: 'Scrie un titlu.' })
    .trim()
    .min(3, 'Titlul trebuie să aibă cel puțin 3 caractere.')
    .max(80, 'Titlul poate avea maximum 80 de caractere.'),

  shortDescription: z
    .string({ error: 'Scrie o descriere scurtă.' })
    .trim()
    .min(20, 'Descrierea scurtă trebuie să aibă cel puțin 20 de caractere.')
    .max(300, 'Descrierea scurtă poate avea maximum 300 de caractere.'),

  description: z
    .string({ error: 'Scrie descrierea serviciului.' })
    .trim()
    .min(50, 'Descrierea trebuie să aibă cel puțin 50 de caractere.')
    .max(4000, 'Descrierea poate avea maximum 4000 de caractere.'),

  features: lines,

  // Gol înseamnă „preț la cerere".
  priceFrom: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? null : value),
    z.coerce
      .number({ error: 'Introdu un număr.' })
      .int('Introdu un număr întreg de lei.')
      .min(0, 'Prețul nu poate fi negativ.')
      .max(1_000_000, 'Prețul pare prea mare.')
      .nullable()
  ),

  coverImage: z
    .string({ error: 'Alege o imagine de copertă.' })
    .trim()
    .regex(IMAGE_PATTERN, 'Folosește o cale locală (/images/...) sau un URL https.'),

  titleRu: ruText(80),
  shortDescriptionRu: ruText(300),
  descriptionRu: ruText(4000),
  featuresRu: ruLines,

  published: z.boolean(),

  order: z.coerce
    .number({ error: 'Introdu un număr.' })
    .int('Introdu un număr întreg.')
    .min(0, 'Ordinea nu poate fi negativă.')
    .max(9999, 'Ordinea poate fi cel mult 9999.'),
})

/** First issue per field; a problem in one "Ce include" line points at the field. */
export function toServiceFieldErrors(error) {
  const fieldErrors = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '')
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return fieldErrors
}

export const serviceMessages = {
  error: 'Ceva nu a mers bine. Încearcă din nou.',
  noDatabase:
    'Baza de date nu este conectată. Adaugă DATABASE_URL în .env.local ca să poți edita serviciile.',
}
