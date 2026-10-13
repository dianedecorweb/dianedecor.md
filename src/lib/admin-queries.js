import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import * as fallback from '@/lib/fallback-content'

/**
 * Reads for the admin area.
 *
 * Unlike `src/lib/queries.js`, these ignore `published` — the studio has to see
 * drafts in order to publish them. When MongoDB is not configured yet they serve
 * the bundled catalogue read-only, so the admin screens are still explorable;
 * every write path refuses separately with a clear message.
 */

export function canEditContent() {
  return isDatabaseConfigured()
}

export async function getAdminProjects() {
  if (!canEditContent()) {
    return fallback.projects.map((project) => ({
      id: project.slug,
      slug: project.slug,
      title: project.title,
      clientNames: project.clientNames,
      location: project.location,
      eventDate: project.eventDate,
      coverImage: project.coverImage,
      featured: fallback.featuredProjects.some((entry) => entry.slug === project.slug),
      published: true,
      order: 0,
      category: project.category,
    }))
  }

  return prisma.project.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      clientNames: true,
      location: true,
      eventDate: true,
      coverImage: true,
      featured: true,
      published: true,
      order: true,
      category: { select: { name: true, slug: true } },
    },
  })
}

export async function getAdminProject(id) {
  if (!canEditContent()) {
    const project = fallback.projects.find((entry) => entry.slug === id)
    if (!project) return null

    return {
      id: project.slug,
      ...project,
      categorySlug: project.category.slug,
      featured: fallback.featuredProjects.some((entry) => entry.slug === project.slug),
      published: true,
      order: 0,
    }
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { category: { select: { slug: true, name: true } } },
  })

  if (!project) return null
  return { ...project, categorySlug: project.category.slug }
}

/** Every category, published or not, for the form's select. */
export async function getAdminCategories() {
  if (!canEditContent()) {
    return fallback.categories.map((category) => ({
      id: category.slug,
      name: category.name,
      slug: category.slug,
    }))
  }

  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true, slug: true },
  })
}

/** Existing slugs, so a new or renamed project cannot collide with another. */
export async function getTakenSlugs(exceptId) {
  if (!canEditContent()) return fallback.projects.map((project) => project.slug)

  const projects = await prisma.project.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : undefined,
    select: { slug: true },
  })

  return projects.map((project) => project.slug)
}

/** Every review, shown or hidden, in the order the site uses. */
export async function getAdminTestimonials() {
  if (!canEditContent()) {
    return fallback.testimonials.map((testimonial, index) => ({
      ...testimonial,
      id: testimonial.id ?? `fallback-${index}`,
      published: true,
      order: index + 1,
    }))
  }

  return prisma.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      authorName: true,
      eventType: true,
      content: true,
      published: true,
      order: true,
    },
  })
}

export async function getAdminTestimonial(id) {
  if (!canEditContent()) {
    return (await getAdminTestimonials()).find((testimonial) => testimonial.id === id) ?? null
  }

  return prisma.testimonial.findUnique({
    where: { id },
    select: {
      id: true,
      authorName: true,
      eventType: true,
      content: true,
      published: true,
      order: true,
    },
  })
}

/** Ziua de azi în Chișinău, ca dată „doar zi" (miezul nopții UTC). */
export function chisinauToday() {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Chisinau' }).format(new Date())
  return new Date(`${day}T00:00:00.000Z`)
}

/**
 * Mesajele pentru panou: căutare și filtre făcute în bază, nu în pagină.
 *
 * Lista vizibilă e mărginită, dar cifrele din antet vin din numărători
 * separate, deci rămân corecte oricâte mesaje s-ar aduna. `due` aduce cererile
 * cu data de revenire azi sau trecută, încă nearhivate.
 */
export async function getAdminInbox({ status = null, q = '', due = false } = {}) {
  const { listFallbackMessages } = await import('@/lib/message-store')
  const term = q.trim()
  const today = chisinauToday()

  const matches = (message) =>
    !term ||
    [message.name, message.phone, message.email, message.message, message.location]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term.toLowerCase()))
  const isDue = (message) =>
    message.followUpAt && new Date(message.followUpAt) <= today && message.status !== 'ARCHIVED'

  const fallbackAll = listFallbackMessages().filter(matches)
  const fallbackShown = fallbackAll.filter(
    (message) => (!status || message.status === status) && (!due || isDue(message))
  )

  const emptyCounts = { all: 0, NEW: 0, READ: 0, CONTACTED: 0, ARCHIVED: 0, due: 0 }

  if (!canEditContent()) {
    const counts = { ...emptyCounts }
    for (const message of fallbackAll) {
      counts.all += 1
      counts[message.status] += 1
      if (isDue(message)) counts.due += 1
    }
    return { messages: fallbackShown, counts, truncated: false }
  }

  const insensitive = (value) => ({ contains: value, mode: 'insensitive' })
  const search = term
    ? {
        OR: [
          { name: insensitive(term) },
          { phone: { contains: term } },
          { phone: { contains: term.replace(/\s/g, '') } },
          { email: insensitive(term) },
          { message: insensitive(term) },
          { location: insensitive(term) },
        ],
      }
    : {}
  const dueWhere = { followUpAt: { lte: today }, status: { not: 'ARCHIVED' } }
  const where = { ...search, ...(status ? { status } : {}), ...(due ? dueWhere : {}) }
  const LIMIT = 300

  const [messages, grouped, dueCount, shownTotal] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, take: LIMIT }),
    prisma.contactMessage.groupBy({ by: ['status'], where: search, _count: { _all: true } }),
    prisma.contactMessage.count({ where: { ...search, ...dueWhere } }),
    prisma.contactMessage.count({ where }),
  ])

  const counts = { ...emptyCounts, due: dueCount }
  for (const row of grouped) {
    counts[row.status] = row._count._all
    counts.all += row._count._all
  }
  for (const message of fallbackAll) {
    counts.all += 1
    counts[message.status] += 1
  }

  return {
    messages: [...messages, ...fallbackShown].sort((a, b) => b.createdAt - a.createdAt),
    counts,
    truncated: shownTotal > LIMIT,
  }
}

const MONTH_NAMES = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec']

/**
 * Cifrele pentru pagina de statistici, adunate din cererile ultimelor 12 luni
 * și din apăsările ultimelor 30 de zile. Volumul unui studio e de ordinul
 * sutelor de cereri pe an, așa că se numără aici, nu în bază.
 */
export async function getAdminStats() {
  const now = new Date()
  const months = []
  for (let back = 11; back >= 0; back--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1))
    months.push({
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
      label: `${MONTH_NAMES[date.getUTCMonth()]} ${String(date.getUTCFullYear()).slice(2)}`,
      count: 0,
    })
  }
  const since = new Date(`${months[0].key}-01T00:00:00.000Z`)

  const clickSince = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
  const clickSinceDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Chisinau' }).format(clickSince)

  const empty = { months, byType: [], bySource: [], byStatus: {}, total: 0, clicks: [], clickTotal: 0 }
  if (!canEditContent()) return empty

  const [messages, clickRows] = await Promise.all([
    prisma.contactMessage.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, eventType: true, source: true, status: true },
    }),
    prisma.channelClick.findMany({ where: { day: { gte: clickSinceDay } } }),
  ])

  const tally = (rows, pick) => {
    const counts = new Map()
    for (const row of rows) counts.set(pick(row), (counts.get(pick(row)) ?? 0) + 1)
    return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
  }

  const byMonth = new Map(months.map((month) => [month.key, month]))
  for (const message of messages) {
    const key = message.createdAt.toISOString().slice(0, 7)
    const month = byMonth.get(key)
    if (month) month.count += 1
  }

  const byStatus = { NEW: 0, READ: 0, CONTACTED: 0, ARCHIVED: 0 }
  for (const message of messages) byStatus[message.status] += 1

  const clicks = new Map()
  for (const row of clickRows) {
    const key = `${row.channel}|${row.source}`
    clicks.set(key, (clicks.get(key) ?? 0) + row.count)
  }

  return {
    months,
    // „Altceva — petrecere corporativă" se numără la „Altceva".
    byType: tally(messages, (message) => message.eventType.split(' — ')[0]),
    bySource: tally(messages, (message) => message.source ?? 'site'),
    byStatus,
    total: messages.length,
    clicks: [...clicks.entries()]
      .map(([key, count]) => {
        const [channel, source] = key.split('|')
        return { channel, source, count }
      })
      .sort((a, b) => b.count - a.count),
    clickTotal: clickRows.reduce((sum, row) => sum + row.count, 0),
  }
}

const SERVICE_FIELDS = {
  id: true,
  slug: true,
  title: true,
  shortDescription: true,
  description: true,
  features: true,
  priceFrom: true,
  coverImage: true,
  published: true,
  order: true,
}

/** Every service, shown or hidden, in the site's order. */
export async function getAdminServices() {
  if (!canEditContent()) {
    return fallback.services.map((service, index) => ({
      ...service,
      id: service.slug,
      published: true,
      order: index + 1,
    }))
  }
  return prisma.service.findMany({ orderBy: { order: 'asc' }, select: SERVICE_FIELDS })
}

export async function getAdminService(id) {
  if (!canEditContent()) {
    return (await getAdminServices()).find((service) => service.id === id) ?? null
  }
  return prisma.service.findUnique({ where: { id }, select: SERVICE_FIELDS })
}
