import { NextResponse } from 'next/server'

import { isAuthenticated } from '@/lib/auth'
import { isFallbackMessageId, updateFallbackMessageStatus } from '@/lib/message-store'
import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import { isMessageStatus } from '@/lib/message-status'
import { isValidObjectId } from '@/lib/utils'

export async function PATCH(request, { params }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }

  const { id } = await params

  let status

  try {
    ;({ status } = await request.json())
  } catch {
    return NextResponse.json({ ok: false, message: 'Cerere invalidă.' }, { status: 400 })
  }

  if (!isMessageStatus(status)) {
    return NextResponse.json({ ok: false, message: 'Status invalid.' }, { status: 400 })
  }

  try {
    if (isFallbackMessageId(id)) {
      const updated = updateFallbackMessageStatus(id, status)
      if (!updated) {
        return NextResponse.json({ ok: false, message: 'Mesajul nu există.' }, { status: 404 })
      }
      return NextResponse.json({ ok: true, status })
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json({ ok: false, message: 'Identificator invalid.' }, { status: 400 })
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: false, message: 'Baza de date nu este configurată.' }, { status: 503 })
    }

    await prisma.contactMessage.update({ where: { id }, data: { status } })
    return NextResponse.json({ ok: true, status })
  } catch (error) {
    console.error('[api/admin/messages]', error.message)
    return NextResponse.json({ ok: false, message: 'Actualizarea a eșuat.' }, { status: 500 })
  }
}
