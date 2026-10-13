import { revalidatePublicSite } from '@/lib/revalidate'

/** Every public page that can show portfolio content, in both languages. */
export function revalidatePortfolio() {
  revalidatePublicSite()
}

/** Maps validated form input onto the Prisma columns. */
export function toProjectData(input, categoryId, slug) {
  return {
    title: input.title,
    slug,
    categoryId,
    clientNames: input.clientNames ?? null,
    location: input.location ?? null,
    eventDate: input.eventDate ? new Date(input.eventDate) : null,
    shortDescription: input.shortDescription,
    description: input.description,
    coverImage: input.coverImage,
    beforeImage: input.beforeImage ?? null,
    images: input.images,
    titleRu: input.titleRu,
    locationRu: input.locationRu,
    shortDescriptionRu: input.shortDescriptionRu,
    descriptionRu: input.descriptionRu,
    featured: input.featured,
    published: input.published,
    order: input.order,
  }
}
