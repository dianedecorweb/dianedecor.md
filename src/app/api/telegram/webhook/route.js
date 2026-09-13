import { NextResponse } from 'next/server'

import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import { isFallbackMessageId, updateFallbackMessageStatus } from '@/lib/message-store'
import { STATUS_LABELS } from '@/lib/message-status'
import { answerCallback, parseCallbackData, syncStatus } from '@/lib/telegram'
import { isValidObjectId } from '@/lib/utils'

/**
 * Primește apăsările pe butoanele de stare din grupul de Telegram.
 *
 * Telegram cheamă ruta asta, deci e publică. Singura ei apărare e antetul
 * secret trimis de Telegram, pe care l-am înregistrat odată cu webhook-ul:
 * fără el, oricine ar putea schimba starea cererilor cunoscând doar adresa.
 */
export async function POST(request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET

  if (!secret) {
    console.error('[telegram/webhook] TELEGRAM_WEBHOOK_SECRET lipsește')
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  if (request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  let update

  try {
    update = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const callback = update?.callback_query

  // Orice altceva decât o apăsare pe buton ne interesează: răspundem 200 ca
  // Telegram să nu reîncerce la nesfârșit.
  if (!callback) return NextResponse.json({ ok: true })

  const parsed = parseCallbackData(callback.data)

  if (!parsed) {
    await answerCallback(callback.id, 'Buton necunoscut.').catch(() => {})
    return NextResponse.json({ ok: true })
  }

  const { status, messageId } = parsed

  try {
    if (isFallbackMessageId(messageId)) {
      const updated = updateFallbackMessageStatus(messageId, status)
      await answerCallback(
        callback.id,
        updated ? `Marcat: ${STATUS_LABELS[status]}` : 'Mesajul nu mai există.'
      )
      return NextResponse.json({ ok: true })
    }

    if (!isValidObjectId(messageId) || !isDatabaseConfigured()) {
      await answerCallback(callback.id, 'Mesajul nu poate fi actualizat.')
      return NextResponse.json({ ok: true })
    }

    const message = await prisma.contactMessage.update({
      where: { id: messageId },
      data: { status },
    })

    await answerCallback(callback.id, `Marcat: ${STATUS_LABELS[status]}`)
    await syncStatus(message.telegramMessageId ?? callback.message?.message_id, message, status)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[telegram/webhook]', error.message)
    await answerCallback(callback.id, 'Actualizarea a eșuat.').catch(() => {})
    return NextResponse.json({ ok: true })
  }
}
