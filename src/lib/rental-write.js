import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { uniqueSlug } from '@/lib/slug'

/** The catalogue page and the rental service page that links to it. The sitemap is built per request. */
export function revalidateRental() {
  revalidatePath('/chirie-decor')
  revalidatePath('/(site)/servicii/[slug]', 'page')
}

/** A slug from the name, unique among the other items. */
export async function rentalSlug(name, exceptId) {
  const others = await prisma.rentalItem.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : undefined,
    select: { slug: true },
  })
  return uniqueSlug(name, others.map((item) => item.slug))
}
