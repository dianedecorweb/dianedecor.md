import { Package } from 'lucide-react'

import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import RentalCatalog from '@/components/rental/RentalCatalog'
import EmptyState from '@/components/ui/EmptyState'
import { getDictionary } from '@/i18n'
import { Link } from '@/i18n/client'
import { alternatesFor } from '@/i18n/config'
import { getRentalItems } from '@/lib/queries'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  return {
    title: t.rental.metaTitle,
    description: t.rental.metaDescription,
    alternates: alternatesFor(lang, '/chirie-decor'),
  }
}

export default async function RentalCatalogPage({ params }) {
  const t = getDictionary((await params).lang)
  const items = await getRentalItems(t.lang)

  return (
    <Container className="pt-16 pb-24 md:pt-20 md:pb-32">
      <SectionHeading
        as="h1"
        eyebrow={t.rental.eyebrow}
        title={t.rental.title}
        description={t.rental.text}
      />

      <div className="mt-12">
        {items.length > 0 ? (
          <RentalCatalog items={items} />
        ) : (
          <EmptyState
            icon={Package}
            title={t.rental.emptyTitle}
            description={t.rental.emptyText}
            actionLabel={t.layout.requestOffer}
            actionHref="/contact?tip=chirie-decor"
          />
        )}
      </div>

      {items.length > 0 ? (
        <p className="mt-16 text-sm text-muted">
          {t.rental.notFound}{' '}
          <Link href="/contact?tip=chirie-decor" className="text-ink underline underline-offset-4 hover:text-accent-deep">
            {t.common.writeUs}
          </Link>{' '}
          {t.rental.notFoundAfter}
        </p>
      ) : null}
    </Container>
  )
}
