import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { canEditContent } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  testimonialMessages,
  testimonialSchema,
  toTestimonialFieldErrors,
} from '@/lib/testimonial-schema'
import { isValidObjectId } from '@/lib/utils'

/** Shared preamble: auth, a live database and a real id. */
async function guard(id) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }
  if (!canEditContent()) {
    return NextResponse.json(
      { ok: false, message: testimonialMessages.noDatabase },
      { status: 503 }
    )
  }
  if (!isValidObjectId(id)) {
    return NextResponse.json({ ok: false, message: 'Identificator invalid.' }, { status: 400 })
  }
  return null
}

/** Prisma's "record to update/delete not found". */
const isMissing = (error) => error?.code === 'P2025'

export async function PATCH(request, { params }) {
  const { id } = await params
  const blocked = await guard(id)
  if (blocked) return blocked

  let payload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: testimonialMessages.error }, { status: 400 })
  }

  // The show/hide switch in the list sends only this one field.
  const isToggle =
    payload && typeof payload.published === 'boolean' && Object.keys(payload).length === 1

  let data
  if (isToggle) {
    data = { published: payload.published }
  } else {
    const result = testimonialSchema.safeParse(payload)
    if (!result.success) {
      return NextResponse.json(
        { ok: false, errors: toTestimonialFieldErrors(result.error) },
        { status: 400 }
      )
    }
    data = result.data
  }

  try {
    await prisma.testimonial.update({
      where: { id },
      data: { ...data, featured: data.published },
      select: { id: true },
    })
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isMissing(error)) {
      return NextResponse.json({ ok: false, message: 'Recenzia nu există.' }, { status: 404 })
    }
    console.error('[api/admin/testimonials] update failed:', error.message)
    return NextResponse.json({ ok: false, message: testimonialMessages.error }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const blocked = await guard(id)
  if (blocked) return blocked

  try {
    await prisma.testimonial.delete({ where: { id }, select: { id: true } })
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isMissing(error)) {
      return NextResponse.json({ ok: false, message: 'Recenzia nu există.' }, { status: 404 })
    }
    console.error('[api/admin/testimonials] delete failed:', error.message)
    return NextResponse.json({ ok: false, message: testimonialMessages.error }, { status: 500 })
  }
}
