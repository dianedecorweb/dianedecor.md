import { NextResponse } from 'next/server'

import { canEditContent } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidObjectId } from '@/lib/utils'

export async function DELETE(request, { params }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }
  if (!canEditContent()) {
    return NextResponse.json({ ok: false, message: 'Baza de date nu este conectată.' }, { status: 503 })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ ok: false, message: 'Identificator invalid.' }, { status: 400 })
  }

  try {
    await prisma.bookedDate.delete({ where: { id }, select: { id: true } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ ok: false, message: 'Ziua nu era marcată.' }, { status: 404 })
    }
    console.error('[api/admin/booked-dates]', error.message)
    return NextResponse.json({ ok: false, message: 'Ștergerea a eșuat.' }, { status: 500 })
  }
}
