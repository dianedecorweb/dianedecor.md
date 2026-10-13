import { NextResponse } from 'next/server'

import { canEditContent } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rentalMessages, rentalSchema, toRentalFieldErrors } from '@/lib/rental-schema'
import { rentalSlug, revalidateRental } from '@/lib/rental-write'
import { isValidObjectId } from '@/lib/utils'

async function guard(id) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }
  if (!canEditContent()) {
    return NextResponse.json({ ok: false, message: rentalMessages.noDatabase }, { status: 503 })
  }
  if (!isValidObjectId(id)) {
    return NextResponse.json({ ok: false, message: 'Identificator invalid.' }, { status: 400 })
  }
  return null
}

const isMissing = (error) => error?.code === 'P2025'

export async function PATCH(request, { params }) {
  const { id } = await params
  const blocked = await guard(id)
  if (blocked) return blocked

  let payload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: rentalMessages.error }, { status: 400 })
  }

  // The show/hide switch in the list sends only this one field.
  const isToggle =
    payload && typeof payload.published === 'boolean' && Object.keys(payload).length === 1

  let data
  if (isToggle) {
    data = { published: payload.published }
  } else {
    const result = rentalSchema.safeParse(payload)
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: toRentalFieldErrors(result.error) }, { status: 400 })
    }
    data = { ...result.data, slug: await rentalSlug(result.data.name, id) }
  }

  try {
    await prisma.rentalItem.update({ where: { id }, data, select: { id: true } })
    revalidateRental()
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isMissing(error)) return NextResponse.json({ ok: false, message: 'Obiectul nu există.' }, { status: 404 })
    console.error('[api/admin/rental] update failed:', error.message)
    return NextResponse.json({ ok: false, message: rentalMessages.error }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const blocked = await guard(id)
  if (blocked) return blocked

  try {
    await prisma.rentalItem.delete({ where: { id }, select: { id: true } })
    revalidateRental()
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isMissing(error)) return NextResponse.json({ ok: false, message: 'Obiectul nu există.' }, { status: 404 })
    console.error('[api/admin/rental] delete failed:', error.message)
    return NextResponse.json({ ok: false, message: rentalMessages.error }, { status: 500 })
  }
}
