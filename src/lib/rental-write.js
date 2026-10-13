import { revalidatePublicSite } from '@/lib/revalidate'

import { prisma } from '@/lib/prisma'
import { uniqueSlug } from '@/lib/slug'

/** The catalogue appears on its own page and is linked from the rental service page. */
export function revalidateRental() {
  revalidatePublicSite()
}

/** A slug from the name, unique among the other items. */
export async function rentalSlug(name, exceptId) {
  const others = await prisma.rentalItem.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : undefined,
    select: { slug: true },
  })
  return uniqueSlug(name, others.map((item) => item.slug))
}
