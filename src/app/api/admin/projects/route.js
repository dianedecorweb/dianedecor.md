import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { canEditContent, getTakenSlugs } from '@/lib/admin-queries'
import { prisma } from '@/lib/prisma'
import { projectMessages, projectSchema, toProjectFieldErrors } from '@/lib/project-schema'
import { revalidatePortfolio, toProjectData } from '@/lib/project-write'
import { uniqueSlug } from '@/lib/slug'

export async function POST(request) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: 'Neautorizat.' }, { status: 401 })
  }

  if (!canEditContent()) {
    return NextResponse.json({ ok: false, message: projectMessages.noDatabase }, { status: 503 })
  }

  let payload

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: projectMessages.error }, { status: 400 })
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ ok: false, message: projectMessages.error }, { status: 400 })
  }

  const result = projectSchema.safeParse(payload)

  if (!result.success) {
    return NextResponse.json(
      { ok: false, errors: toProjectFieldErrors(result.error) },
      { status: 400 }
    )
  }

  try {
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

    const taken = await getTakenSlugs()
    const slug = uniqueSlug(result.data.slug || result.data.title, taken)

    const project = await prisma.project.create({
      data: toProjectData(result.data, category.id, slug),
      select: { id: true, slug: true },
    })

    revalidatePortfolio()

    return NextResponse.json({ ok: true, id: project.id, slug: project.slug })
  } catch (error) {
    console.error('[api/admin/projects] create failed:', error.message)
    return NextResponse.json({ ok: false, message: projectMessages.error }, { status: 500 })
  }
}
