import { revalidatePath } from 'next/cache'

/**
 * Every public page that shows portfolio content, refreshed after any write.
 *
 * Whole route patterns, not single slugs: one project change also moves the
 * category lists, the "previous / next" links on its neighbours and the related
 * projects on service pages. Refreshing only the edited project's own URL left
 * those stale for up to five minutes — including links to a deleted project.
 */
export function revalidatePortfolio() {
  revalidatePath('/')
  revalidatePath('/portofoliu')
  revalidatePath('/(site)/portofoliu/[slug]', 'page')
  revalidatePath('/(site)/portofoliu/categorie/[slug]', 'page')
  revalidatePath('/(site)/servicii/[slug]', 'page')
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
    featured: input.featured,
    published: input.published,
    order: input.order,
  }
}
