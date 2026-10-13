import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'

import CtaBand from '@/components/home/CtaBand'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import ProjectCard from '@/components/portfolio/ProjectCard'
import JsonLd, { breadcrumbSchema } from '@/components/seo/JsonLd'
import Badge from '@/components/ui/Badge'
import { formatPriceFrom, toParagraphs } from '@/lib/format'
import Icon from '@/components/ui/Icon'
import { getRelatedProjects, getServiceBySlug, getServiceSlugs } from '@/lib/queries'
import { serviceCategoryMap } from '@/lib/site-config'
import { truncate } from '@/lib/utils'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export async function generateStaticParams() {
  const services = await getServiceSlugs()
  return services.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) return { title: 'Serviciu indisponibil' }

  return {
    title: service.title,
    description: truncate(service.shortDescription, 160),
    alternates: { canonical: `/servicii/${service.slug}` },
    openGraph: {
      type: 'article',
      title: service.title,
      description: truncate(service.shortDescription, 160),
      url: `/servicii/${service.slug}`,
      // Coperta e opțională la servicii; fără ea rămâne imaginea generală.
      images: service.coverImage ? [{ url: service.coverImage, alt: service.title }] : undefined,
    },
    // Fără asta, X/Twitter moștenește titlul și poza generale ale site-ului,
    // iar un link partajat arăta altceva decât pagina.
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: truncate(service.shortDescription, 160),
      images: service.coverImage ? [service.coverImage] : undefined,
    },
  }
}

export default async function ServicePage({ params }) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  if (!service) notFound()

  const relatedCategorySlug = serviceCategoryMap[service.slug]
  const relatedProjects = relatedCategorySlug
    ? await getRelatedProjects(relatedCategorySlug, null, 3)
    : []

  const priceFrom = formatPriceFrom(service.priceFrom)
  const paragraphs = toParagraphs(service.description)

  const crumbs = [
    { label: 'Acasă', href: '/' },
    { label: 'Servicii', href: '/servicii' },
    { label: service.title, href: `/servicii/${service.slug}` },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <Container className="pt-12 pb-10 md:pt-16">
        <Breadcrumbs items={crumbs} />

        <div className="mt-8 flex flex-col gap-5">
          <Icon name={service.icon} size={30} strokeWidth={1.25} aria-hidden="true" className="text-accent" />
          <h1>{service.title}</h1>
          <p className="max-w-[62ch] text-lg text-ink-soft">{service.shortDescription}</p>
          {priceFrom ? <Badge tone="accent">{priceFrom}</Badge> : null}
        </div>
      </Container>

      <Container className="pb-16 md:pb-20">
        <div className="relative aspect-3/2 w-full overflow-hidden bg-line md:aspect-[21/9]">
          <Image
            src={service.coverImage}
            alt={`Exemplu de ${service.title.toLowerCase()} realizat de DianeDecor`}
            fill
            sizes="(min-width: 1280px) 1184px, 100vw"
            quality={85}
            priority
            className="object-cover"
          />
        </div>
      </Container>

      <Container className="pb-20 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
          <div className="prose-ro max-w-[68ch] text-ink-soft">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="border border-line bg-paper p-6 md:p-8">
            <h2 className="text-2xl">Ce include</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-ink-soft">
                  <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-sage" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {relatedProjects.length > 0 ? (
        <Container className="pb-20 md:pb-28">
          <div className="flex flex-col gap-8 border-t border-line pt-12">
            <h2 className="text-3xl">Proiecte de acest tip</h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {relatedProjects.map((project) => (
                <li key={project.slug}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </div>
        </Container>
      ) : null}

      <CtaBand
        title={`Vrei o ofertă pentru ${service.title.toLowerCase()}?`}
        description="Scrie-ne data, locația și numărul de invitați. Îți răspundem în cel mult 24 de ore."
        ctaHref={`/contact?tip=${service.slug}`}
      />
    </>
  )
}
