import { NextResponse } from 'next/server'

import { parseDay } from '@/lib/booking'
import { isDatabaseConfigured, prisma } from '@/lib/prisma'

/**
 * Spune dacă o zi e deja rezervată. Public, deci întoarce doar da sau nu,
 * niciodată ce eveniment e în ziua aceea.
 */
export async function GET(request) {
  const day = parseDay(new URL(request.url).searchParams.get('data'))
  if (!day) return NextResponse.json({ ok: false, message: 'Dată invalidă.' }, { status: 400 })

  // Fără bază de date nu știm; formularul pur și simplu nu afișează nimic.
  if (!isDatabaseConfigured()) return NextResponse.json({ ok: true, booked: null })

  try {
    const found = await prisma.bookedDate.findUnique({ where: { date: day }, select: { id: true } })
    return NextResponse.json(
      { ok: true, booked: Boolean(found) },
      { headers: { 'Cache-Control': 'private, max-age=60' } }
    )
  } catch (error) {
    console.error('[api/availability]', error.message)
    return NextResponse.json({ ok: true, booked: null })
  }
}
