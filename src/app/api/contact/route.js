import { NextResponse } from 'next/server'

import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import { isFallbackMessageId, saveFallbackMessage } from '@/lib/message-store'
import { checkRateLimit, getClientIp, recordRateLimitHit } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/utils'
import { formMessages } from '@/lib/site-config'
import { contactSchema, toFieldErrors } from '@/lib/validation'
import { sendNotification } from '@/lib/telegram'

const RATE_LIMIT = { limit: 3, windowMs: 10 * 60 * 1000 }
const MIN_FILL_TIME_MS = 3000
const RAPID_SUBMIT_MARKER = '[verificare: trimis rapid] '

/** Bots fill hidden honeypot fields; these are dropped silently. */
function isHoneypotTriggered({ website }) {
  return typeof website === 'string' && website.trim() !== ''
}

/** Returns true if submission arrived suspiciously fast after mount. */
function isRapidSubmit({ renderedAt }) {
  const rendered = Number(renderedAt)
  return Number.isFinite(rendered) && Date.now() - rendered < MIN_FILL_TIME_MS
}

export async function POST(request) {
  let payload

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: formMessages.error }, { status: 400 })
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ ok: false, message: formMessages.error }, { status: 400 })
  }

  // Silent success for honeypot — a bot must not learn that it was detected.
  if (isHoneypotTriggered(payload)) {
    return NextResponse.json({ ok: true })
  }

  const rateLimitKey = `contact:${getClientIp(request)}`

  const { allowed, retryAfterSeconds } = checkRateLimit(
    rateLimitKey,
    RATE_LIMIT
  )

  if (!allowed) {
    return NextResponse.json(
      { ok: false, message: formMessages.rateLimited },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

  const result = contactSchema.safeParse(payload)

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: toFieldErrors(result.error) }, { status: 400 })
  }

  recordRateLimitHit(rateLimitKey)

  const rapidSubmit = isRapidSubmit(payload)

  const data = {
    name: sanitizeText(result.data.name, 80),
    phone: sanitizeText(result.data.phone, 30),
    email: result.data.email ? sanitizeText(result.data.email, 120) : null,
    eventType:
      result.data.eventType === 'Altceva' && result.data.eventTypeOther
        ? `Altceva — ${sanitizeText(result.data.eventTypeOther, 60)}`
        : sanitizeText(result.data.eventType, 60),
    eventDate: result.data.eventDate ? new Date(result.data.eventDate) : null,
    location: result.data.location ? sanitizeText(result.data.location, 120) : null,
    guestCount: result.data.guestCount ?? null,
    message: rapidSubmit
      ? `${RAPID_SUBMIT_MARKER}${sanitizeText(result.data.message, 1000)}`
      : sanitizeText(result.data.message, 1000),
  }

  let stored

  try {
    if (!isDatabaseConfigured()) throw new Error('DATABASE_URL is not configured')
    stored = await prisma.contactMessage.create({ data })
  } catch (error) {
    console.error('[api/contact] database write failed, using fallback store:', error.message)
    try {
      const result = saveFallbackMessage(data)
      stored = result.message
      if (!result.persisted) {
        console.error(
          '[api/contact] fallback message was not persisted to disk — it exists in memory only'
        )
      }
    } catch (fallbackError) {
      console.error('[api/contact] fallback store failed:', fallbackError.message)
      return NextResponse.json({ ok: false, message: formMessages.error }, { status: 500 })
    }
  }

  // Notificarea pleacă în fluxul cererii, nu după răspuns.
  //
  // A stat în `after()` ca vizitatorul să nu aștepte, dar pe Vercel funcția e
  // înghețată imediat ce răspunsul a plecat: mesajul ajungea în grup, iar
  // scrierea de după — cea care leagă cererea de mesajul din Telegram — nu mai
  // apuca să se execute. Fără legătura aia, o schimbare de stare din panou nu
  // poate actualiza butoanele din grup.
  //
  // Costul e o singură chemare, mărginită la 5 secunde. Dacă Telegram tace,
  // cererea e deja salvată și apare în panou.
  try {
    const telegramMessageId = await sendNotification(stored, stored.id)

    if (telegramMessageId && isDatabaseConfigured() && !isFallbackMessageId(stored.id)) {
      await prisma.contactMessage.update({
        where: { id: stored.id },
        data: { telegramMessageId },
      })
    }
  } catch (error) {
    console.error('[api/contact] Telegram notification failed:', error.message)
  }

  return NextResponse.json({ ok: true, id: stored.id })
}
