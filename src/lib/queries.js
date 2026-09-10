import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import * as fallback from '@/lib/fallback-content'
import { listFallbackMessages } from '@/lib/message-store'

/**
 * Every read the site performs lives here; pages never touch `prisma` directly.
 *
 * Each read is wrapped in `read()`, which returns the bundled content from
 * `src/lib/content.js` when MongoDB is not configured yet or is unreachable.
 * That keeps the site fully renderable before the Atlas connection string
 * exists, and keeps a database outage from taking the public pages down.
 */
async function read(label, query, fallbackValue) {
  if (!isDatabaseConfigured()) return fallbackValue()

  try {
    return await query()
  } catch (error) {
    console.error(`[queries] ${label} failed, serving bundled content:`, error.message)
    throw error
  }
}

const projectCardSelect = {
  slug: true,
  title: true,
  clientNames: true,
  location: true,
  eventDate: true,
  coverImage: true,
  shortDescription: true,
  category: { select: { name: true, slug: true } },
}

export async function getCategories() {
  return read(
    'getCategories',
    () =>
      prisma.category.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
        select: { name: true, slug: true, description: true },
      }),
    () => fallback.categories
  )
}

export async function getFeaturedProjects(limit = 4) {
  return read(
    'getFeaturedProjects',
    () =>
      prisma.project.findMany({
        where: { featured: true, published: true },
        orderBy: { order: 'asc' },
        take: limit,
        select: projectCardSelect,
      }),
    () => fallback.featuredProjects.slice(0, limit)
  )
}

export async function getProjectsByCategory(categorySlug) {
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
    }
  )
}

export async function getRelatedProjects(categorySlug, excludeSlug, limit = 3) {
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
    }
  )
}

export async function getProjectBySlug(slug) {
  return read(
    'getProjectBySlug',
    () =>
      prisma.project.findFirst({
        where: { slug, published: true, category: { is: { published: true } } },
        select: {
          ...projectCardSelect,
          description: true,
          images: true,
        },
      }),
    () => {
      const publishedSlugs = fallback.categories
        .filter((cat) => cat.published)
        .map((cat) => cat.slug)
      const project = fallback.projects.find((project) => project.slug === slug)
      return project && publishedSlugs.includes(project.category.slug) ? project : null
    }
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
export async function getProjectNeighbours(categorySlug, currentSlug) {
  const siblings = await read(
    'getProjectNeighbours',
    () =>
      prisma.project.findMany({
        where: { published: true, category: { is: { slug: categorySlug, published: true } } },
        orderBy: { order: 'asc' },
        select: { slug: true, title: true },
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
    }
  )

  const index = siblings.findIndex((project) => project.slug === currentSlug)
  if (index === -1) return { previous: null, next: null }

  return {
    previous: index > 0 ? siblings[index - 1] : null,
    next: index < siblings.length - 1 ? siblings[index + 1] : null,
  }
}

export async function getServices() {
  return read(
    'getServices',
    () =>
      prisma.service.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
        select: {
          slug: true,
          title: true,
          shortDescription: true,
          icon: true,
          features: true,
          coverImage: true,
          priceFrom: true,
        },
      }),
    () => fallback.services
  )
}

export async function getServiceBySlug(slug) {
  return read(
    'getServiceBySlug',
    () =>
      prisma.service.findFirst({
        where: { slug, published: true },
        select: {
          slug: true,
          title: true,
          shortDescription: true,
          description: true,
          icon: true,
          features: true,
          coverImage: true,
          priceFrom: true,
        },
      }),
    () => fallback.services.find((service) => service.slug === slug) ?? null
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

export async function getFeaturedTestimonials(limit = 6) {
  return read(
    'getFeaturedTestimonials',
    () =>
      prisma.testimonial.findMany({
        where: { featured: true, published: true },
        orderBy: { order: 'asc' },
        take: limit,
        select: { id: true, authorName: true, eventType: true, content: true, rating: true },
      }),
    () => fallback.testimonials.slice(0, limit)
  )
}

/**
 * Admin inbox. Reads MongoDB and merges in anything the fail-safe store picked
 * up while the database was unavailable, newest first.
 */
export async function getMessages(status) {
  const stored = listFallbackMessages(status)

  const fromDatabase = await read(
    'getMessages',
    () =>
      prisma.contactMessage.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    () => []
  )

  return [...fromDatabase, ...stored].sort((a, b) => b.createdAt - a.createdAt)
}

