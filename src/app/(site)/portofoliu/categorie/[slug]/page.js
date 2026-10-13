import { notFound } from 'next/navigation'
import { ImageOff } from 'lucide-react'

import CtaBand from '@/components/home/CtaBand'
import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import CategoryFilter from '@/components/portfolio/CategoryFilter'
import ProjectGrid from '@/components/portfolio/ProjectGrid'
import EmptyState from '@/components/ui/EmptyState'
import { getCategories, getProjectsByCategory } from '@/lib/queries'
import { truncate } from '@/lib/utils'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

/**
 * One static page per category, instead of reading `?categorie=` on the server.
 * That kept /portofoliu out of the CDN cache — every visitor's request had to
 * reach the origin. These prerender, so they are served from the edge, and each
 * one gets its own title, description and sitemap entry.
 */
export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const categories = await getCategories()
  const category = categories.find((entry) => entry.slug === slug)

  if (!category) return { title: 'Categorie indisponibilă' }

  return {
    // Prefixul ține titlul unic: unele categorii poartă același nume ca un
    // serviciu („Cerere în căsătorie"), iar Google vedea două pagini identice.
    title: `Portofoliu: ${category.name}`,
    description: truncate(category.description, 160),
    alternates: { canonical: `/portofoliu/categorie/${category.slug}` },
  }
}

export default async function PortfolioCategoryPage({ params }) {
  const { slug } = await params
  const [categories, projects] = await Promise.all([
    getCategories(),
    getProjectsByCategory(slug),
  ])

  const category = categories.find((entry) => entry.slug === slug)
  if (!category) notFound()

  return (
    <>
      <Container className="pt-16 pb-12 md:pt-20 md:pb-16">
        <SectionHeading
          as="h1"
          eyebrow="Portofoliu"
          title={category.name}
          description={category.description}
        />

        <div className="mt-10 border-y border-line py-5">
          <CategoryFilter categories={categories} activeSlug={slug} />
        </div>

        <div className="mt-10 md:mt-14">
          <h2 className="sr-only">Proiecte din categoria {category.name}</h2>

          {projects.length > 0 ? (
            <ProjectGrid projects={projects} />
          ) : (
            <EmptyState
              icon={ImageOff}
              title="Momentan nu avem proiecte publicate în această categorie."
              description="Adăugăm proiecte noi după fiecare sezon. Între timp, poți vedea restul lucrărilor noastre."
              actionLabel="Vezi toate proiectele"
              actionHref="/portofoliu"
            />
          )}
        </div>
      </Container>

      <CtaBand />
    </>
  )
}
