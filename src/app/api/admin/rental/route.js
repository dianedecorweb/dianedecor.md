import { NextResponse } from 'next/server'

import { canEditContent } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rentalMessages, rentalSchema, toRentalFieldErrors } from '@/lib/rental-schema'
import { rentalSlug, revalidateRental } from '@/lib/rental-write'

export async function POST(request) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }
  if (!canEditContent()) {
    return NextResponse.json({ ok: false, message: rentalMessages.noDatabase }, { status: 503 })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: rentalMessages.error }, { status: 400 })
  }

  const result = rentalSchema.safeParse(payload)
  if (!result.success) {
    return NextResponse.json({ ok: false, errors: toRentalFieldErrors(result.error) }, { status: 400 })
  }

  try {
    const item = await prisma.rentalItem.create({
      data: { ...result.data, slug: await rentalSlug(result.data.name) },
      select: { id: true },
    })
    revalidateRental()
    return NextResponse.json({ ok: true, id: item.id })
  } catch (error) {
    console.error('[api/admin/rental] create failed:', error.message)
    return NextResponse.json({ ok: false, message: rentalMessages.error }, { status: 500 })
  }
}
