import { z } from 'zod'

/**
 * One schema for a portfolio project, imported by both `ProjectForm` and the
 * admin route handlers. The client uses it for inline feedback; the server
 * re-runs it and never trusts what arrives.
 */

/** Local paths under /images or absolute URLs on the hosts next.config allows. */
const IMAGE_PATTERN = /^(\/images\/[\w\-./]+\.(jpe?g|png|webp|avif)|https:\/\/[^\s]+)$/i

const imagePath = z
  .string()
  .trim()
  .regex(IMAGE_PATTERN, 'Folosește o cale locală (/images/portfolio/...) sau un URL https.')

/** Treats an untouched input ('' or null) as "not provided". */
function optional(schema) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    schema.optional()
  )
}

export const projectSchema = z.object({
  title: z
    .string({ error: 'Scrie un titlu.' })
    .trim()
    .min(3, 'Titlul trebuie să aibă cel puțin 3 caractere.')
    .max(120, 'Titlul poate avea maximum 120 de caractere.'),

  slug: optional(
    z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug-ul poate conține doar litere mici, cifre și cratime.'
      )
      .max(80, 'Slug-ul poate avea maximum 80 de caractere.')
  ),

  categorySlug: z
    .string({ error: 'Alege o categorie.' })
    .trim()
    .min(1, 'Alege o categorie.'),

  clientNames: optional(
    z.string().trim().max(80, 'Numele clienților pot avea maximum 80 de caractere.')
  ),

  location: optional(z.string().trim().max(120, 'Locația poate avea maximum 120 de caractere.')),

  eventDate: optional(
    z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Introdu o dată validă.')
  ),

  shortDescription: z
    .string({ error: 'Scrie o descriere scurtă.' })
    .trim()
    .min(20, 'Descrierea scurtă trebuie să aibă cel puțin 20 de caractere.')
    .max(300, 'Descrierea scurtă poate avea maximum 300 de caractere.'),

  description: z
    .string({ error: 'Scrie descrierea proiectului.' })
    .trim()
    .min(50, 'Descrierea trebuie să aibă cel puțin 50 de caractere.')
    .max(4000, 'Descrierea poate avea maximum 4000 de caractere.'),

  coverImage: imagePath,

  // Sala goală, înainte de decor. Opțională; cu ea, pagina arată comparația.
  beforeImage: optional(imagePath),

  images: z
    .array(imagePath)
    .min(1, 'Adaugă cel puțin o imagine în galerie.')
    .max(20, 'Galeria poate avea maximum 20 de imagini.'),

  featured: z.boolean(),
  published: z.boolean(),

  order: z.coerce
    .number({ error: 'Introdu un număr.' })
    .int('Introdu un număr întreg.')
    .min(0, 'Ordinea nu poate fi negativă.')
    .max(9999, 'Ordinea poate fi cel mult 9999.'),
})

/** Turns a ZodError into `{ fieldName: 'mesaj' }`, keeping the first issue per field. */
export function toProjectFieldErrors(error) {
  const fieldErrors = {}

  for (const issue of error.issues) {
    const field = issue.path.join('.')
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message
    }
  }

  return fieldErrors
}

export const projectMessages = {
  created: 'Proiectul a fost creat.',
  updated: 'Modificările au fost salvate.',
  deleted: 'Proiectul a fost șters.',
  error: 'Ceva nu a mers bine. Încearcă din nou.',
  noDatabase:
    'Baza de date nu este conectată. Adaugă DATABASE_URL în .env.local ca să poți edita portofoliul.',
}
