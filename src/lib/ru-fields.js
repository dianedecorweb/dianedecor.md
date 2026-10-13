import { z } from 'zod'

/**
 * Câmpurile în rusă din panou. Toate sunt opționale: ce rămâne gol apare pe
 * /ru în română. Un câmp golit șterge traducerea; un câmp care lipsește din
 * cerere o lasă neatinsă, ca un formular care nu-l trimite să nu o piardă.
 */
export const ruText = (max) =>
  z.preprocess(
    (value) => (value === undefined ? undefined : typeof value === 'string' && value.trim() ? value : null),
    z.string().trim().max(max, `Cel mult ${max} de caractere.`).nullable().optional()
  )

/** „Ce include" în rusă: un rând pe element, ca la varianta românească. */
export const ruLines = z.preprocess(
  (value) =>
    typeof value === 'string' ? value.split('\n').map((line) => line.trim()).filter(Boolean) : value,
  z
    .array(z.string().max(160, 'Un rând poate avea maximum 160 de caractere.'))
    .max(12, 'Cel mult 12 rânduri.')
    .optional()
)
