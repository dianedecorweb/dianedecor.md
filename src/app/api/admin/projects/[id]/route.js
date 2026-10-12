import { NextResponse } from 'next/server'

import { isAuthenticated } from '@/lib/auth'
import { canEditContent, getTakenSlugs } from '@/lib/admin-queries'
import { prisma } from '@/lib/prisma'
import { projectMessages, projectSchema, toProjectFieldErrors } from '@/lib/project-schema'
import { revalidatePortfolio, toProjectData } from '@/lib/project-write'
import { uniqueSlug } from '@/lib/slug'
import { isValidObjectId } from '@/lib/utils'

/** Shared preamble: both handlers need auth, a live database and a real id. */
async function guard(id) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }

  if (!canEditContent()) {
    return NextResponse.json({ ok: false, message: projectMessages.noDatabase }, { status: 503 })
  }

  if (!isValidObjectId(id)) {
    return NextResponse.json({ ok: false, message: 'Identificator invalid.' }, { status: 400 })
  }

  return null
}

export async function PATCH(request, { params }) {
  const { id } = await params
  const blocked = await guard(id)
  if (blocked) return blocked

  let payload

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: projectMessages.error }, { status: 400 })
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ ok: false, message: projectMessages.error }, { status: 400 })
  }

  // A publish/feature toggle from the list sends only that one field.
  if (typeof payload.published === 'boolean' && Object.keys(payload).length === 1) {
    return toggleFlag(id, { published: payload.published })
  }
  if (typeof payload.featured === 'boolean' && Object.keys(payload).length === 1) {
    return toggleFlag(id, { featured: payload.featured })
  }

  const result = projectSchema.safeParse(payload)

  if (!result.success) {
    return NextResponse.json(
      { ok: false, errors: toProjectFieldErrors(result.error) },
      { status: 400 }
    )
  }

  try {
    const existing = await prisma.project.findUnique({ where: { id }, select: { slug: true } })
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Proiectul nu există.' }, { status: 404 })
    }

    const category = await prisma.category.findUnique({
      where: { slug: result.data.categorySlug },
      select: { id: true },
    })

    if (!category) {
      return NextResponse.json(
        { ok: false, errors: { categorySlug: 'Categoria nu există.' } },
        { status: 400 }
      )
    }

    const requested = result.data.slug || result.data.title
    const taken = await getTakenSlugs(id)
    const slug = uniqueSlug(requested, taken)

    const project = await prisma.project.update({
      where: { id },
      data: toProjectData(result.data, category.id, slug),
      select: { id: true, slug: true },
    })

    // Covers the old URL after a rename too: it is one of the pattern's pages.
    revalidatePortfolio()

    return NextResponse.json({ ok: true, id: project.id, slug: project.slug })
  } catch (error) {
    console.error('[api/admin/projects] update failed:', error.message)
    return NextResponse.json({ ok: false, message: projectMessages.error }, { status: 500 })
  }
}

async function toggleFlag(id, data) {
  try {
    await prisma.project.update({ where: { id }, data, select: { id: true } })
    revalidatePortfolio()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/admin/projects] toggle failed:', error.message)
    return NextResponse.json({ ok: false, message: projectMessages.error }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params
  const blocked = await guard(id)
  if (blocked) return blocked

  try {
    await prisma.project.delete({ where: { id }, select: { id: true } })
    revalidatePortfolio()

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/admin/projects] delete failed:', error.message)
    return NextResponse.json({ ok: false, message: projectMessages.error }, { status: 500 })
  }
}
