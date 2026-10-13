import { z } from 'zod'

import { ruText } from '@/lib/ru-fields'

/** Shared by `RentalForm` and the admin routes: same rules on both sides. */

const IMAGE_PATTERN = /^(\/images\/[\w\-./]+\.(jpe?g|png|webp|avif)|https:\/\/[^\s]+)$/i

export const PRICE_UNITS = {
  zi: 'pe zi',
  eveniment: 'pe eveniment',
  bucata: 'pe bucată',
}

export const rentalSchema = z.object({
  name: z
    .string({ error: 'Scrie numele obiectului.' })
    .trim()
    .min(3, 'Numele trebuie să aibă cel puțin 3 caractere.')
    .max(80, 'Numele poate avea maximum 80 de caractere.'),

  description: z
    .string({ error: 'Scrie o descriere scurtă.' })
    .trim()
    .min(10, 'Descrierea trebuie să aibă cel puțin 10 caractere.')
    .max(300, 'Descrierea poate avea maximum 300 de caractere.'),

  image: z
    .string({ error: 'Încarcă o poză.' })
    .trim()
    .regex(IMAGE_PATTERN, 'Încarcă o poză sau folosește un URL https.'),

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

  priceUnit: z.enum(Object.keys(PRICE_UNITS), { error: 'Alege pentru ce e prețul.' }),

  nameRu: ruText(80),
  descriptionRu: ruText(300),

  published: z.boolean(),

  order: z.coerce
    .number({ error: 'Introdu un număr.' })
    .int('Introdu un număr întreg.')
    .min(0, 'Ordinea nu poate fi negativă.')
    .max(9999, 'Ordinea poate fi cel mult 9999.'),
})

export function toRentalFieldErrors(error) {
  const fieldErrors = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '')
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return fieldErrors
}

export const rentalMessages = {
  error: 'Ceva nu a mers bine. Încearcă din nou.',
  noDatabase:
    'Baza de date nu este conectată. Adaugă DATABASE_URL în .env.local ca să poți edita catalogul.',
}
