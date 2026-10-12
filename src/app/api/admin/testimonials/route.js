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

export async function POST(request) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }

  if (!canEditContent()) {
    return NextResponse.json(
      { ok: false, message: testimonialMessages.noDatabase },
      { status: 503 }
    )
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: testimonialMessages.error }, { status: 400 })
  }

  const result = testimonialSchema.safeParse(payload)
  if (!result.success) {
    return NextResponse.json(
      { ok: false, errors: toTestimonialFieldErrors(result.error) },
      { status: 400 }
    )
  }

  try {
    const testimonial = await prisma.testimonial.create({
      // `featured` mirrors `published`, so the column never contradicts the switch.
      data: { ...result.data, featured: result.data.published },
      select: { id: true },
    })

    // Reviews appear only on the home page.
    revalidatePath('/')
    return NextResponse.json({ ok: true, id: testimonial.id })
  } catch (error) {
    console.error('[api/admin/testimonials] create failed:', error.message)
    return NextResponse.json({ ok: false, message: testimonialMessages.error }, { status: 500 })
  }
}
