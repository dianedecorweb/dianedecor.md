import Link from 'next/link'
import { Package } from 'lucide-react'

import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import RentalCatalog from '@/components/rental/RentalCatalog'
import EmptyState from '@/components/ui/EmptyState'
import { getRentalItems } from '@/lib/queries'

export const revalidate = 300

export const metadata = {
  title: 'Chirie decor',
  description:
    'Arcade, suporturi, vaze și alte elemente de decor de închiriat pentru nunți, cumetrii și evenimente din Chișinău și toată Moldova. Alege ce îți trebuie și cere o ofertă.',
  alternates: { canonical: '/chirie-decor' },
}

export default async function RentalCatalogPage() {
  const items = await getRentalItems()

  return (
    <Container className="pt-16 pb-24 md:pt-20 md:pb-32">
      <SectionHeading
        as="h1"
        eyebrow="Chirie decor"
        title="Decor de închiriat pentru evenimentul tău"
        description="Alege ce îți trebuie, iar lista ajunge la noi odată cu cererea de ofertă. Livrăm, montăm și strângem după eveniment."
      />

      <div className="mt-12">
        {items.length > 0 ? (
          <RentalCatalog items={items} />
        ) : (
          <EmptyState
            icon={Package}
            title="Catalogul se completează."
            description="Până atunci, scrie-ne ce ai vrea să închiriezi și îți spunem ce avem disponibil."
            actionLabel="Cere o ofertă"
            actionHref="/contact?tip=chirie-decor"
          />
        )}
      </div>

      {items.length > 0 ? (
        <p className="mt-16 text-sm text-muted">
          Nu găsești ce cauți?{' '}
          <Link href="/contact?tip=chirie-decor" className="text-ink underline underline-offset-4 hover:text-accent-deep">
            Scrie-ne
          </Link>{' '}
          și îți spunem ce mai avem.
        </p>
      ) : null}
    </Container>
  )
}
