import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Admin authentication: one shared account, no registration.
 *
 * The session is a signed HS256 JWT stored in an httpOnly cookie. It is written
 * by hand on top of `node:crypto` rather than pulled from a library — the token
 * is issued and verified by this app alone, so a full JOSE implementation would
 * be weight without a purpose.
 */

export const SESSION_COOKIE = 'dd_admin_session'
const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SESSION_SECRET is missing or too short (need at least 16 characters).')
  }
  return secret
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function sign(data) {
  return createHmac('sha256', getSecret()).update(data).digest('base64url')
}

/** Constant-time comparison that does not leak the expected length. */
function safeEqual(a, b) {
  const bufferA = Buffer.from(String(a))
  const bufferB = Buffer.from(String(b))

  if (bufferA.length !== bufferB.length) {
    // Still burn a comparison so timing does not depend on the length.
    timingSafeEqual(bufferA, bufferA)
    return false
  }

  return timingSafeEqual(bufferA, bufferB)
}

/**
 * Costul scrypt. 16384 × 8 înseamnă 16 MB de memorie pe încercare, ceea ce ține
 * un atac cu dicționar la câteva zeci de încercări pe secundă pe hardware
 * obișnuit, dar rămâne sub 100 ms pentru un login real.
 */
const SCRYPT = { N: 16384, r: 8, p: 1, keyLength: 64 }

/**
 * `scrypt:N:r:p:sare:cheie`, totul în hex.
 *
 * Separatorul e `:`, nu `$` ca în formatul PHC: încărcătorul de `.env` al lui
 * Next expandează `$N` ca referință la altă variabilă și ar goli hash-ul.
 */
export function hashPassword(password, salt = randomBytes(16)) {
  const key = scryptSync(password, salt, SCRYPT.keyLength, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: 256 * 1024 * 1024,
  })

  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('hex'), key.toString('hex')].join(
    ':'
  )
}

/** Recalculează hash-ul cu sarea stocată și compară în timp constant. */
function verifyPassword(password, stored) {
  const parts = String(stored).split(':')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [, n, r, p, saltHex, keyHex] = parts
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(keyHex, 'hex')

  let actual
  try {
    actual = scryptSync(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: 256 * 1024 * 1024,
    })
  } catch {
    return false
  }

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** Checks the submitted credentials against the configured admin account. */
export function verifyCredentials(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL
  const expectedHash = process.env.ADMIN_PASSWORD_HASH

  if (!expectedEmail || !expectedHash) {
    throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not configured.')
  }

  if (typeof email !== 'string' || typeof password !== 'string') return false

  // Ambele verificări rulează întotdeauna, ca un email greșit să nu fie mai
  // rapid decât o parolă greșită.
  const emailMatches = safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase())
  const passwordMatches = verifyPassword(password, expectedHash)

  return emailMatches && passwordMatches
}

export function createSessionToken(email) {
  const issuedAt = Math.floor(Date.now() / 1000)

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: 'admin',
      email,
      iat: issuedAt,
      exp: issuedAt + SESSION_MAX_AGE_SECONDS,
    })
  )

  return `${header}.${payload}.${sign(`${header}.${payload}`)}`
}

/** Returns the token's claims, or null if it is malformed, forged or expired. */
export function verifySessionToken(token) {
  if (typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [header, payload, signature] = parts
  if (!safeEqual(signature, sign(`${header}.${payload}`))) return null

  let claims
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (typeof claims.exp !== 'number' || claims.exp <= now) return null

  return claims
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}

/** Server-side auth check for admin pages and admin route handlers. */
export async function getAdminSession() {
  const cookieStore = await cookies()
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function isAuthenticated() {
  return (await getAdminSession()) !== null
}
