import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react'

import CtaBand from '@/components/home/CtaBand'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import BeforeAfter from '@/components/portfolio/BeforeAfter'
import Lightbox from '@/components/portfolio/Lightbox'
import JsonLd, { breadcrumbSchema } from '@/components/seo/JsonLd'
import Badge from '@/components/ui/Badge'
import { getDictionary } from '@/i18n'
import { Link } from '@/i18n/client'
import { alternatesFor, localePath } from '@/i18n/config'
import { formatEventDate, toIsoDate, toParagraphs } from '@/lib/format'
import { getProjectBySlug, getProjectNeighbours, getProjectSlugs } from '@/lib/queries'
import { truncate } from '@/lib/utils'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export async function generateStaticParams() {
  const projects = await getProjectSlugs()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) return { title: getDictionary(lang).project.unavailable }

  const path = `/portofoliu/${project.slug}`
  return {
    title: project.title,
    description: truncate(project.shortDescription, 160),
    alternates: alternatesFor(lang, path),
    openGraph: {
      type: 'article',
      title: project.title,
      description: truncate(project.shortDescription, 160),
      url: localePath(lang, path),
      images: [{ url: project.coverImage, alt: project.title }],
    },
    // Fără asta, X/Twitter moștenește titlul și poza generale ale site-ului,
    // iar un link partajat arăta altceva decât pagina.
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: truncate(project.shortDescription, 160),
      images: [project.coverImage],
    },
  }
}

export default async function ProjectPage({ params }) {
  const { lang, slug } = await params
  const t = getDictionary(lang)
  const project = await getProjectBySlug(slug)

  if (!project) notFound()

  const neighbours = await getProjectNeighbours(project.category.slug, project.slug)
  const eventDate = formatEventDate(project.eventDate, lang)
  const paragraphs = toParagraphs(project.description)

  const crumbs = [
    { label: t.common.home, href: '/' },
    { label: t.portfolio.metaTitle, href: '/portofoliu' },
    { label: project.title, href: `/portofoliu/${project.slug}` },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs, lang)} />

      <Container className="pt-12 pb-16 md:pt-16 md:pb-20">
        <Breadcrumbs items={crumbs} label={t.layout.breadcrumbs} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col gap-5">
            <Badge tone="accent">{project.category.name}</Badge>
            <h1>{project.title}</h1>
            {project.clientNames ? (
              <div className="border-t border-line pt-4">
                <p className="font-display text-3xl text-accent-deep md:text-4xl">
                  {project.clientNames}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-ink">{project.shortDescription}</p>

            <dl className="grid grid-cols-1 gap-4 border-t border-line pt-6 sm:grid-cols-2">
              {eventDate ? (
                <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
                  <CalendarDays
                    size={18}
                    aria-hidden="true"
                    className="row-span-2 mt-0.5 text-muted"
                  />
                  <dt className="eyebrow">{t.project.eventDate}</dt>
                  <dd className="mt-1 text-sm text-ink">
                    <time dateTime={toIsoDate(project.eventDate)}>{eventDate}</time>
                  </dd>
                </div>
              ) : null}

              {project.location ? (
                <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
                  <MapPin size={18} aria-hidden="true" className="row-span-2 mt-0.5 text-muted" />
                  <dt className="eyebrow">{t.project.location}</dt>
                  <dd className="mt-1 text-sm text-ink">{project.location}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </Container>

      <Container className="pb-16 md:pb-20">
        <div className="prose-ro max-w-[68ch] text-ink-soft">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Container>

      {project.beforeImage ? (
        <Container className="pb-16 md:pb-20">
          <h2 className="text-3xl">{t.project.beforeAfter}</h2>
          <div className="mt-6">
            <BeforeAfter before={project.beforeImage} after={project.coverImage} title={project.title} />
          </div>
        </Container>
      ) : null}

      <Container className="pb-20 md:pb-28">
        <h2 className="sr-only">{t.project.gallery}</h2>
        <Lightbox images={project.images} projectTitle={project.title} />
      </Container>

      {neighbours.previous || neighbours.next ? (
        <Container className="pb-20 md:pb-28">
          <nav
            aria-label={t.project.neighbours}
            className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
          >
            {neighbours.previous ? (
              <Link
                href={`/portofoliu/${neighbours.previous.slug}`}
                className="group flex flex-col gap-2 border border-line bg-paper p-6 transition-colors duration-200 ease-out hover:border-muted/60"
              >
                <span className="eyebrow inline-flex items-center gap-2">
                  <ArrowLeft size={14} aria-hidden="true" />
                  {t.project.previous}
                </span>
                <span className="font-display text-xl text-ink">{neighbours.previous.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {neighbours.next ? (
              <Link
                href={`/portofoliu/${neighbours.next.slug}`}
                className="group flex flex-col gap-2 border border-line bg-paper p-6 transition-colors duration-200 ease-out hover:border-muted/60 sm:items-end sm:text-right"
              >
                <span className="eyebrow inline-flex items-center gap-2">
                  {t.project.next}
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
                <span className="font-display text-xl text-ink">{neighbours.next.title}</span>
              </Link>
            ) : null}
          </nav>
        </Container>
      ) : null}

      <CtaBand t={t} />
    </>
  )
}
