import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import * as fallback from '@/lib/fallback-content'

/**
 * Every read the site performs lives here; pages never touch `prisma` directly.
 *
 * Each read is wrapped in `read()`, which returns the bundled content from
 * `src/lib/content.js` when MongoDB is not configured yet or is unreachable.
 * That keeps the site fully renderable before the Atlas connection string
 * exists, and keeps a database outage from taking the public pages down.
 */
async function read(label, query, fallbackValue, lang = 'ro') {
  if (!isDatabaseConfigured()) return fallbackValue()

  try {
    return localize(await query(), lang)
  } catch (error) {
    // Mesajul spunea că servește conținutul din pachet, dar arunca eroarea mai
    // departe — deci rezerva nu intra niciodată în funcțiune și o pană a bazei
    // de date dobora tot site-ul, inclusiv build-ul.
    console.error(`[queries] ${label} failed, serving bundled content:`, error.message)
    return fallbackValue()
  }
}

/**
 * Pe /ru, fiecare câmp `x` primește valoarea lui `xRu` când traducerea există;
 * altfel rămâne româna. Câmpurile `xRu` nu ies din funcție în nicio limbă, ca
 * să nu ajungă degeaba în paginile trimise browserului.
 */
function localize(value, lang) {
  if (Array.isArray(value)) return value.map((item) => localize(item, lang))
  if (!value || typeof value !== 'object' || value instanceof Date) return value

  const out = {}
  for (const [key, field] of Object.entries(value)) {
    if (key.endsWith('Ru')) continue
    const ru = value[`${key}Ru`]
    const translated = lang === 'ru' && (Array.isArray(ru) ? ru.length > 0 : Boolean(ru?.trim()))
    out[key] = localize(translated ? ru : field, lang)
  }
  return out
}

const projectCardSelect = {
  slug: true,
  title: true,
  titleRu: true,
  clientNames: true,
  location: true,
  locationRu: true,
  eventDate: true,
  coverImage: true,
  shortDescription: true,
  shortDescriptionRu: true,
  category: { select: { name: true, nameRu: true, slug: true } },
}

export async function getCategories(lang) {
  return read(
    'getCategories',
    () =>
      prisma.category.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
        select: { name: true, nameRu: true, slug: true, description: true, descriptionRu: true },
      }),
    () => fallback.categories,
    lang
  )
}

export async function getFeaturedProjects(limit = 4, lang) {
  return read(
    'getFeaturedProjects',
    () =>
      prisma.project.findMany({
        where: { featured: true, published: true },
        orderBy: { order: 'asc' },
        take: limit,
        select: projectCardSelect,
      }),
    () => fallback.featuredProjects.slice(0, limit),
    lang
  )
}

export async function getProjectsByCategory(categorySlug, lang) {
  return read(
    'getProjectsByCategory',
    () =>
      prisma.project.findMany({
        where: {
          published: true,
          category: { is: { published: true, ...(categorySlug ? { slug: categorySlug } : {}) } },
        },
        orderBy: { order: 'asc' },
        select: projectCardSelect,
      }),
    () => {
      const publishedSlugs = fallback.categories
        .filter((cat) => cat.published)
        .map((cat) => cat.slug)
      return categorySlug
        ? fallback.projects.filter(
            (project) =>
              project.category.slug === categorySlug && publishedSlugs.includes(project.category.slug)
          )
        : fallback.projects.filter((project) => publishedSlugs.includes(project.category.slug))
    },
    lang
  )
}

export async function getRelatedProjects(categorySlug, excludeSlug, limit = 3, lang) {
  return read(
    'getRelatedProjects',
    () =>
      prisma.project.findMany({
        where: {
          published: true,
          category: { is: { slug: categorySlug, published: true } },
          ...(excludeSlug ? { NOT: { slug: excludeSlug } } : {}),
        },
        orderBy: { order: 'asc' },
        take: limit,
        select: projectCardSelect,
      }),
    () => {
      const publishedSlugs = fallback.categories
        .filter((cat) => cat.published)
        .map((cat) => cat.slug)
      return fallback.projects
        .filter(
          (project) =>
            project.category.slug === categorySlug &&
            publishedSlugs.includes(project.category.slug) &&
            project.slug !== excludeSlug
        )
        .slice(0, limit)
    },
    lang
  )
}

export async function getProjectBySlug(slug, lang) {
  return read(
    'getProjectBySlug',
    () =>
      prisma.project.findFirst({
        where: { slug, published: true, category: { is: { published: true } } },
        select: {
          ...projectCardSelect,
          description: true,
          descriptionRu: true,
          images: true,
          beforeImage: true,
        },
      }),
    () => {
      const publishedSlugs = fallback.categories
        .filter((cat) => cat.published)
        .map((cat) => cat.slug)
      const project = fallback.projects.find((project) => project.slug === slug)
      return project && publishedSlugs.includes(project.category.slug) ? project : null
    },
    lang
  )
}

export async function getProjectSlugs() {
  return read(
    'getProjectSlugs',
    () =>
      prisma.project.findMany({
        where: { published: true, category: { is: { published: true } } },
        orderBy: { order: 'asc' },
        select: { slug: true, updatedAt: true },
      }),
    () => {
      const publishedSlugs = fallback.categories
        .filter((cat) => cat.published)
        .map((cat) => cat.slug)
      return fallback.projects
        .filter((project) => publishedSlugs.includes(project.category.slug))
        .map(({ slug, updatedAt }) => ({ slug, updatedAt }))
    }
  )
}

/** Previous and next project inside the same category, for detail-page paging. */
export async function getProjectNeighbours(categorySlug, currentSlug, lang) {
  const siblings = await read(
    'getProjectNeighbours',
    () =>
      prisma.project.findMany({
        where: { published: true, category: { is: { slug: categorySlug, published: true } } },
        orderBy: { order: 'asc' },
        select: { slug: true, title: true, titleRu: true },
      }),
    () => {
      const publishedSlugs = fallback.categories
        .filter((cat) => cat.published)
        .map((cat) => cat.slug)
      return fallback.projects
        .filter(
          (project) =>
            project.category.slug === categorySlug && publishedSlugs.includes(project.category.slug)
        )
        .map(({ slug, title }) => ({ slug, title }))
    },
    lang
  )

  const index = siblings.findIndex((project) => project.slug === currentSlug)
  if (index === -1) return { previous: null, next: null }

  return {
    previous: index > 0 ? siblings[index - 1] : null,
    next: index < siblings.length - 1 ? siblings[index + 1] : null,
  }
}

export async function getServices(lang) {
  return read(
    'getServices',
    () =>
      prisma.service.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
        select: {
          slug: true,
          title: true,
          titleRu: true,
          shortDescription: true,
          shortDescriptionRu: true,
          icon: true,
          features: true,
          featuresRu: true,
          coverImage: true,
          priceFrom: true,
        },
      }),
    () => fallback.services,
    lang
  )
}

export async function getServiceBySlug(slug, lang) {
  return read(
    'getServiceBySlug',
    () =>
      prisma.service.findFirst({
        where: { slug, published: true },
        select: {
          slug: true,
          title: true,
          titleRu: true,
          shortDescription: true,
          shortDescriptionRu: true,
          description: true,
          descriptionRu: true,
          icon: true,
          features: true,
          featuresRu: true,
          coverImage: true,
          priceFrom: true,
        },
      }),
    () => fallback.services.find((service) => service.slug === slug) ?? null,
    lang
  )
}

export async function getServiceSlugs() {
  return read(
    'getServiceSlugs',
    () =>
      prisma.service.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
        select: { slug: true, updatedAt: true },
      }),
    () => fallback.services.map(({ slug, updatedAt }) => ({ slug, updatedAt }))
  )
}

/**
 * Reviews for the home page. Only `published` decides: the admin exposes a
 * single "shown on the site" switch, so `featured` no longer filters anything.
 */
export async function getFeaturedTestimonials(limit = 12, lang) {
  return read(
    'getFeaturedTestimonials',
    () =>
      prisma.testimonial.findMany({
        where: { published: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        select: {
          id: true,
          authorName: true,
          eventType: true,
          eventTypeRu: true,
          content: true,
          contentRu: true,
          rating: true,
        },
      }),
    () => fallback.testimonials.slice(0, limit),
    lang
  )
}

const rentalCardSelect = {
  id: true,
  slug: true,
  name: true,
  nameRu: true,
  description: true,
  descriptionRu: true,
  image: true,
  priceFrom: true,
  priceUnit: true,
}

/** The public rental catalogue. Empty when the studio has not added anything yet. */
export async function getRentalItems(lang) {
  return read(
    'getRentalItems',
    () =>
      prisma.rentalItem.findMany({
        where: { published: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: rentalCardSelect,
      }),
    () => [],
    lang
  )
}

/** The items a visitor picked, in the order they were picked, published only. */
export async function getRentalItemsBySlugs(slugs, lang) {
  const wanted = [...new Set(slugs)].slice(0, 40)
  if (wanted.length === 0) return []
  const items = await read(
    'getRentalItemsBySlugs',
    () =>
      prisma.rentalItem.findMany({
        where: { slug: { in: wanted }, published: true },
        select: rentalCardSelect,
      }),
    () => [],
    lang
  )
  return wanted.map((slug) => items.find((item) => item.slug === slug)).filter(Boolean)
}

/** One project with a "before" photo for the home page, featured ones first. */
export async function getBeforeAfterShowcase(lang) {
  return read(
    'getBeforeAfterShowcase',
    () =>
      prisma.project.findFirst({
        where: {
          published: true,
          beforeImage: { not: null },
          category: { is: { published: true } },
        },
        orderBy: [{ featured: 'desc' }, { order: 'asc' }],
        select: { slug: true, title: true, titleRu: true, coverImage: true, beforeImage: true },
      }),
    () => null,
    lang
  )
}
