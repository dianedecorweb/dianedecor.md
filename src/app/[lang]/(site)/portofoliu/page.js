import { ImageOff } from 'lucide-react'

import CtaBand from '@/components/home/CtaBand'
import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import CategoryFilter from '@/components/portfolio/CategoryFilter'
import ProjectGrid from '@/components/portfolio/ProjectGrid'
import EmptyState from '@/components/ui/EmptyState'
import { getCategories, getProjectsByCategory } from '@/lib/queries'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export const metadata = {
  title: 'Portofoliu',
  description:
    'Evenimente decorate de DianeDecor în Republica Moldova: nunți, cumetrii, cereri în căsătorie, aniversări, cununii în aer liber și evenimente corporative.',
  alternates: { canonical: '/portofoliu' },
}

/**
 * Every project. Filtering lives in `/portofoliu/categorie/[slug]`, which is
 * prerendered — reading `?categorie=` here made this page uncacheable, and the
 * old query string still works through the redirect in `next.config.mjs`.
 */
export default async function PortfolioPage() {
  const [categories, projects] = await Promise.all([getCategories(), getProjectsByCategory(null)])

  return (
    <>
      <Container className="pt-16 pb-12 md:pt-20 md:pb-16">
        <SectionHeading
          as="h1"
          eyebrow="Portofoliu"
          title="Evenimente pe care le-am decorat"
          description="Fiecare proiect de mai jos este un eveniment real, cu paleta, materialele și locația lui. Filtrează după tipul de eveniment care te interesează."
        />

        <div className="mt-10 border-y border-line py-5">
          <CategoryFilter categories={categories} activeSlug={null} />
        </div>

        <div className="mt-10 md:mt-14">
          <h2 className="sr-only">Toate proiectele</h2>

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
