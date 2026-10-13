import { getCategories, getProjectSlugs, getRentalItems, getServiceSlugs } from '@/lib/queries'
import { getSiteUrl } from '@/lib/site-config'

// Generat la fiecare cerere: lista e mereu exactă și nu depinde de faptul că
// fiecare rută de scriere din panou își amintește să-l reîmprospăteze. Google
// îl cere de câteva ori pe zi, deci o citire din bază de fiecare dată nu costă.
export const dynamic = 'force-dynamic'

const STATIC_ROUTES = [
  { path: '/', priority: 1, changeFrequency: 'monthly' },
  { path: '/servicii', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/portofoliu', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/despre', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
]

export default async function sitemap() {
  const siteUrl = getSiteUrl()
  const [projects, services, categories, rentalItems] = await Promise.all([
    getProjectSlugs(),
    getServiceSlugs(),
    getCategories(),
    getRentalItems(),
  ])
  const now = new Date()

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    // Catalogul de chirie intră în sitemap doar când are ce arăta.
    ...(rentalItems.length > 0
      ? [{ url: `${siteUrl}/chirie-decor`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 }]
      : []),
    ...categories.map((category) => ({
      url: `${siteUrl}/portofoliu/categorie/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...services.map((service) => ({
      url: `${siteUrl}/servicii/${service.slug}`,
      lastModified: service.updatedAt ?? now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...projects.map((project) => ({
      url: `${siteUrl}/portofoliu/${project.slug}`,
      lastModified: project.updatedAt ?? now,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  ]
}
