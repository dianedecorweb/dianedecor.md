import { NextResponse } from 'next/server'

import { isAuthenticated } from '@/lib/auth'
import { isFallbackMessageId, updateFallbackMessageStatus } from '@/lib/message-store'
import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import { isMessageStatus } from '@/lib/message-status'
import { deleteNotification, syncStatus } from '@/lib/telegram'
import { isValidObjectId } from '@/lib/utils'

const NOTE_MAX = 1000
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Turns the request body into the fields to change, or an error message.
 * Any subset of status, note and follow-up date may arrive, never none.
 */
function readChanges(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Cerere invalidă.' }

  const changes = {}

  if ('status' in body) {
    if (!isMessageStatus(body.status)) return { error: 'Status invalid.' }
    changes.status = body.status
  }

  if ('note' in body) {
    if (body.note !== null && typeof body.note !== 'string') return { error: 'Notă invalidă.' }
    const note = (body.note ?? '').trim()
    if (note.length > NOTE_MAX) return { error: `Nota poate avea maximum ${NOTE_MAX} de caractere.` }
    changes.note = note || null
  }

  if ('followUpAt' in body) {
    const day = body.followUpAt
    if (day === null || day === '') changes.followUpAt = null
    else if (typeof day === 'string' && DAY_PATTERN.test(day) && !Number.isNaN(Date.parse(day)))
      changes.followUpAt = new Date(`${day}T00:00:00.000Z`)
    else return { error: 'Dată invalidă.' }
  }

  if (Object.keys(changes).length === 0) return { error: 'Nimic de schimbat.' }
  return { changes }
}

async function guard(id) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }
  if (!isFallbackMessageId(id) && !isValidObjectId(id)) {
    return NextResponse.json({ ok: false, message: 'Identificator invalid.' }, { status: 400 })
  }
  if (!isFallbackMessageId(id) && !isDatabaseConfigured()) {
    return NextResponse.json({ ok: false, message: 'Baza de date nu este configurată.' }, { status: 503 })
  }
  return null
}

/** Prisma's "record to update/delete not found". */
const isMissing = (error) => error?.code === 'P2025'

export async function PATCH(request, { params }) {
  const { id } = await params
  const blocked = await guard(id)
  if (blocked) return blocked

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Cerere invalidă.' }, { status: 400 })
  }

  const { changes, error } = readChanges(body)
  if (error) return NextResponse.json({ ok: false, message: error }, { status: 400 })

  if (isFallbackMessageId(id)) {
    // Mesajele din depozitul de siguranță țin doar starea.
    if (!changes.status || Object.keys(changes).length > 1) {
      return NextResponse.json(
        { ok: false, message: 'Mesajul nu e în baza de date; se poate schimba doar starea.' },
        { status: 400 }
      )
    }
    const updated = updateFallbackMessageStatus(id, changes.status)
    if (!updated) return NextResponse.json({ ok: false, message: 'Mesajul nu există.' }, { status: 404 })
    return NextResponse.json({ ok: true })
  }

  try {
    const message = await prisma.contactMessage.update({ where: { id }, data: changes })

    // Aceeași stare și în grup: cine se uită pe Telegram vede ce s-a apăsat în
    // panou. O eroare aici nu trebuie să pice actualizarea, care a reușit deja.
    if (changes.status) {
      try {
        await syncStatus(message.telegramMessageId, message, changes.status)
      } catch (syncError) {
        console.error('[api/admin/messages] sincronizarea cu Telegram a eșuat:', syncError.message)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (updateError) {
    if (isMissing(updateError)) {
      return NextResponse.json({ ok: false, message: 'Mesajul nu există.' }, { status: 404 })
    }
    console.error('[api/admin/messages]', updateError.message)
    return NextResponse.json({ ok: false, message: 'Actualizarea a eșuat.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const blocked = await guard(id)
  if (blocked) return blocked

  if (isFallbackMessageId(id)) {
    return NextResponse.json(
      { ok: false, message: 'Mesajul nu e în baza de date și nu poate fi șters de aici.' },
      { status: 400 }
    )
  }

  try {
    const message = await prisma.contactMessage.delete({
      where: { id },
      select: { telegramMessageId: true },
    })
    const removedFromTelegram = await deleteNotification(message.telegramMessageId)
    return NextResponse.json({ ok: true, removedFromTelegram })
  } catch (deleteError) {
    if (isMissing(deleteError)) {
      return NextResponse.json({ ok: false, message: 'Mesajul nu există.' }, { status: 404 })
    }
    console.error('[api/admin/messages] ștergere eșuată:', deleteError.message)
    return NextResponse.json({ ok: false, message: 'Ștergerea a eșuat.' }, { status: 500 })
  }
}
