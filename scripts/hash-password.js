/**
 * Generează valoarea pentru ADMIN_PASSWORD_HASH.
 *
 *   node scripts/hash-password.js 'parola-ta'
 *
 * Rezultatul se pune în `.env.local` și în variabilele de mediu de pe Vercel.
 * Parola în clar nu se salvează nicăieri — nici în repo, nici în env.
 */

import { hashPassword } from '../src/lib/auth.js'

const password = process.argv[2]

if (!password) {
  console.error("Folosire: node scripts/hash-password.js 'parola-ta'")
  process.exit(1)
}

if (password.length < 8) {
  console.error('Parola trebuie să aibă cel puțin 8 caractere.')
  process.exit(1)
}

console.log(hashPassword(password))
