import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { canEditContent } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serviceMessages, serviceSchema, toServiceFieldErrors } from '@/lib/service-schema'
import { isValidObjectId } from '@/lib/utils'

/** Every public page that shows a service: list, detail, and the home page grid. */
function revalidateServices() {
  revalidatePath('/')
  revalidatePath('/servicii')
  revalidatePath('/(site)/servicii/[slug]', 'page')
}

export async function PATCH(request, { params }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }
  if (!canEditContent()) {
    return NextResponse.json({ ok: false, message: serviceMessages.noDatabase }, { status: 503 })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ ok: false, message: 'Identificator invalid.' }, { status: 400 })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: serviceMessages.error }, { status: 400 })
  }

  // The show/hide switch in the list sends only this one field.
  const isToggle =
    payload && typeof payload.published === 'boolean' && Object.keys(payload).length === 1

  let data
  if (isToggle) {
    data = { published: payload.published }
  } else {
    const result = serviceSchema.safeParse(payload)
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: toServiceFieldErrors(result.error) }, { status: 400 })
    }
    data = result.data
  }

  try {
    await prisma.service.update({ where: { id }, data, select: { id: true } })
    revalidateServices()
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ ok: false, message: 'Serviciul nu există.' }, { status: 404 })
    }
    console.error('[api/admin/services] update failed:', error.message)
    return NextResponse.json({ ok: false, message: serviceMessages.error }, { status: 500 })
  }
}
