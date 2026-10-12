import { z } from 'zod'

/**
 * One schema for a review, imported by both `TestimonialForm` and the admin
 * route handlers: inline feedback on the client, the same rules re-run on the
 * server, which never trusts what arrives.
 *
 * Rating is not here on purpose: the site never shows it, so the form does not
 * ask for it, and the column keeps its default of 5.
 */
export const testimonialSchema = z.object({
  authorName: z
    .string({ error: 'Scrie numele.' })
    .trim()
    .min(2, 'Numele trebuie să aibă cel puțin 2 caractere.')
    .max(80, 'Numele poate avea maximum 80 de caractere.'),

  eventType: z
    .string({ error: 'Scrie evenimentul.' })
    .trim()
    .min(2, 'Scrie evenimentul, de exemplu „Nuntă, Chișinău".')
    .max(80, 'Evenimentul poate avea maximum 80 de caractere.'),

  content: z
    .string({ error: 'Scrie recenzia.' })
    .trim()
    .min(20, 'Recenzia trebuie să aibă cel puțin 20 de caractere.')
    .max(800, 'Recenzia poate avea maximum 800 de caractere.'),

  published: z.boolean(),

  order: z.coerce
    .number({ error: 'Introdu un număr.' })
    .int('Introdu un număr întreg.')
    .min(0, 'Ordinea nu poate fi negativă.')
    .max(9999, 'Ordinea poate fi cel mult 9999.'),
})

/** Turns a ZodError into `{ fieldName: 'mesaj' }`, keeping the first issue per field. */
export function toTestimonialFieldErrors(error) {
  const fieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path.join('.')
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return fieldErrors
}

export const testimonialMessages = {
  error: 'Ceva nu a mers bine. Încearcă din nou.',
  noDatabase:
    'Baza de date nu este conectată. Adaugă DATABASE_URL în .env.local ca să poți edita recenziile.',
}
