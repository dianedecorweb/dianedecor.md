import { z } from 'zod'

import { eventTypeOptions } from '@/lib/site-config'

/**
 * One schema, imported by both `ContactForm` and `POST /api/contact`. The client
 * uses it for inline feedback; the server re-runs it and never trusts the client.
 */

/**
 * Moldovan numbers (069…, +373…, 373…) and any international one (+39…,
 * 0039…), once spaces, dashes, dots and brackets are gone. The first version
 * took Moldovan numbers only, so a couple living in Italy or Romania — a good
 * share of the weddings here — could not send the form at all, nor could anyone
 * who typed "+373 (69) 216-064".
 */
const PHONE_PATTERN = /^(0\d{8}|\+?373\d{8}|\+\d{8,15}|00\d{8,15})$/
const normalizePhone = (value) => value.replace(/[\s\-.()]/g, '')

/** De unde poate porni o cerere. Orice altă valoare devine „site". */
export const REQUEST_SOURCES = ['fereastra', 'buton', 'chirie', 'site']

/** Treats an untouched input ('' or null) as "not provided". */
function optional(schema) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    schema.optional()
  )
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export const contactSchema = z
  .object({
    name: z
      .string({ error: 'Scrie numele tău.' })
      .trim()
      .min(2, 'Numele trebuie să aibă cel puțin 2 caractere.')
      .max(80, 'Numele poate avea maximum 80 de caractere.'),

    phone: z
      .string({ error: 'Scrie un număr de telefon.' })
      .trim()
      .refine(
        (value) => PHONE_PATTERN.test(normalizePhone(value)),
        'Introdu un număr valid, de exemplu 069 216 064, sau unul din străinătate cu prefixul țării, ca +39 333 123 4567.'
      ),

    email: optional(z.string().trim().pipe(z.email('Introdu o adresă de email validă.'))),

    eventType: z.enum(eventTypeOptions, { error: 'Alege tipul evenimentului.' }),

    eventTypeOther: optional(
      z.string().trim().max(60, 'Descrierea poate avea maximum 60 de caractere.')
    ),

    eventDate: optional(
      z
        .string()
        .refine((value) => !Number.isNaN(Date.parse(value)), 'Introdu o dată validă.')
        .refine((value) => new Date(value) >= startOfToday(), 'Data nu poate fi în trecut.')
        .refine(
          (value) => {
            const max = new Date()
            max.setFullYear(max.getFullYear() + 3)
            return new Date(value) <= max
          },
          'Data nu poate fi mai departe de 3 ani.'
        )
    ),

    location: optional(
      z.string().trim().max(120, 'Locația poate avea maximum 120 de caractere.')
    ),

    guestCount: optional(
      z.coerce
        .number({ error: 'Introdu un număr.' })
        .int('Introdu un număr întreg.')
        .min(1, 'Numărul de invitați trebuie să fie cel puțin 1.')
        .max(2000, 'Numărul de invitați poate fi cel mult 2000.')
    ),

    source: z.preprocess(
      (value) => (REQUEST_SOURCES.includes(value) ? value : 'site'),
      z.enum(REQUEST_SOURCES)
    ),

    // Limba paginii de pe care s-a trimis, ca studioul să știe în ce limbă răspunde.
    locale: z.preprocess((value) => (value === 'ru' ? 'ru' : 'ro'), z.enum(['ro', 'ru'])),

    message: z
      .string({ error: 'Scrie câteva detalii despre eveniment.' })
      .trim()
      .min(10, 'Mesajul trebuie să aibă cel puțin 10 caractere.')
      .max(1000, 'Mesajul poate avea maximum 1000 de caractere.'),
  })
  .superRefine((data, ctx) => {
    if (data.eventType === 'Altceva' && !data.eventTypeOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['eventTypeOther'],
        message: 'Descrie ce eveniment vrei să decorezi.',
      })
    }
  })

/** Turns a ZodError into `{ fieldName: 'mesaj' }`, keeping the first issue per field. */
export function toFieldErrors(error) {
  const fieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message
    }
  }

  return fieldErrors
}
