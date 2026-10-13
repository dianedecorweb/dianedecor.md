import { NextResponse } from 'next/server'

import { canEditContent } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { parseDay } from '@/lib/booking'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }
  if (!canEditContent()) {
    return NextResponse.json({ ok: false, message: 'Baza de date nu este conectată.' }, { status: 503 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Cerere invalidă.' }, { status: 400 })
  }

  const date = parseDay(body?.date)
  if (!date) return NextResponse.json({ ok: false, message: 'Alege o dată validă.' }, { status: 400 })

  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 160) : ''

  try {
    const booked = await prisma.bookedDate.create({
      data: { date, note: note || null },
      select: { id: true },
    })
    return NextResponse.json({ ok: true, id: booked.id })
  } catch (error) {
    // Indexul unic pe dată: ziua e deja marcată.
    if (error?.code === 'P2002') {
      return NextResponse.json({ ok: false, message: 'Ziua asta e deja marcată ca ocupată.' }, { status: 409 })
    }
    console.error('[api/admin/booked-dates]', error.message)
    return NextResponse.json({ ok: false, message: 'Salvarea a eșuat.' }, { status: 500 })
  }
}
