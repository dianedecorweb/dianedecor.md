import { ImageOff } from 'lucide-react'

import CtaBand from '@/components/home/CtaBand'
import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import CategoryFilter from '@/components/portfolio/CategoryFilter'
import ProjectGrid from '@/components/portfolio/ProjectGrid'
import EmptyState from '@/components/ui/EmptyState'
import { getDictionary } from '@/i18n'
import { alternatesFor } from '@/i18n/config'
import { getCategories, getProjectsByCategory } from '@/lib/queries'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  return {
    title: t.portfolio.metaTitle,
    description: t.portfolio.metaDescription,
    alternates: alternatesFor(lang, '/portofoliu'),
  }
}

/**
 * Every project. Filtering lives in `/portofoliu/categorie/[slug]`, which is
 * prerendered — reading `?categorie=` here made this page uncacheable, and the
 * old query string still works through the redirect in `next.config.mjs`.
 */
export default async function PortfolioPage({ params }) {
  const t = getDictionary((await params).lang)
  const [categories, projects] = await Promise.all([getCategories(), getProjectsByCategory(null)])

  return (
    <>
      <Container className="pt-16 pb-12 md:pt-20 md:pb-16">
        <SectionHeading
          as="h1"
          eyebrow={t.portfolio.eyebrow}
          title={t.portfolio.title}
          description={t.portfolio.text}
        />

        <div className="mt-10 border-y border-line py-5">
          <CategoryFilter categories={categories} activeSlug={null} t={t} />
        </div>

        <div className="mt-10 md:mt-14">
          <h2 className="sr-only">{t.portfolio.allProjects}</h2>

          {projects.length > 0 ? (
            <ProjectGrid projects={projects} t={t} />
          ) : (
            <EmptyState
              icon={ImageOff}
              title={t.portfolio.emptyTitle}
              description={t.portfolio.emptyText}
              actionLabel={t.portfolio.emptyAction}
              actionHref="/portofoliu"
            />
          )}
        </div>
      </Container>

      <CtaBand t={t} />
    </>
  )
}
