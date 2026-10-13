import { LOCALES, localePath } from '@/i18n/config'
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

  const routes = [
    ...STATIC_ROUTES,
    // Catalogul de chirie intră în sitemap doar când are ce arăta.
    ...(rentalItems.length > 0 ? [{ path: '/chirie-decor', priority: 0.7, changeFrequency: 'weekly' }] : []),
    ...categories.map((category) => ({
      path: `/portofoliu/categorie/${category.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly',
    })),
    ...services.map((service) => ({
      path: `/servicii/${service.slug}`,
      lastModified: service.updatedAt,
      priority: 0.7,
      changeFrequency: 'monthly',
    })),
    ...projects.map((project) => ({
      path: `/portofoliu/${project.slug}`,
      lastModified: project.updatedAt,
      priority: 0.7,
      changeFrequency: 'monthly',
    })),
  ]

  // Fiecare pagină o dată pe limbă, cu legătura spre varianta celeilalte limbi.
  return routes.flatMap(({ path, lastModified, priority, changeFrequency }) => {
    const languages = Object.fromEntries(LOCALES.map((lang) => [lang, `${siteUrl}${localePath(lang, path)}`]))
    return LOCALES.map((lang) => ({
      url: languages[lang],
      lastModified: lastModified ?? now,
      changeFrequency,
      priority,
      alternates: { languages },
    }))
  })
}
