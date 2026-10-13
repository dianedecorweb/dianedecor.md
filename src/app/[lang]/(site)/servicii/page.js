import { PackageOpen } from 'lucide-react'

import CtaBand from '@/components/home/CtaBand'
import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import ServiceRow from '@/components/services/ServiceRow'
import EmptyState from '@/components/ui/EmptyState'
import { getDictionary } from '@/i18n'
import { alternatesFor } from '@/i18n/config'
import { getServices } from '@/lib/queries'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  return {
    title: t.services.metaTitle,
    description: t.services.metaDescription,
    alternates: alternatesFor(lang, '/servicii'),
  }
}

export default async function ServicesPage({ params }) {
  const t = getDictionary((await params).lang)
  const services = await getServices()

  return (
    <>
      <Container className="pt-16 pb-12 md:pt-20 md:pb-16">
        <SectionHeading
          as="h1"
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          description={t.services.text}
        />
      </Container>

      <Container className="pb-20 md:pb-28">
        {services.length > 0 ? (
          <div className="flex flex-col gap-16 md:gap-24">
            {services.map((service, index) => (
              <ServiceRow
                key={service.slug}
                service={service}
                t={t}
                reversed={index % 2 === 1}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageOpen}
            title={t.services.emptyTitle}
            description={t.services.emptyText}
            actionLabel={t.common.writeUs}
            actionHref="/contact"
          />
        )}
      </Container>

      <CtaBand t={t} />
    </>
  )
}
