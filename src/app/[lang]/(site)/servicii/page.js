import { PackageOpen } from 'lucide-react'

import CtaBand from '@/components/home/CtaBand'
import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import ServiceRow from '@/components/services/ServiceRow'
import EmptyState from '@/components/ui/EmptyState'
import { getServices } from '@/lib/queries'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export const metadata = {
  title: 'Servicii',
  description:
    'Decor de nuntă, cumetrie, cerere în căsătorie, aniversare, cununie în aer liber, baloane cu heliu și chirie decor, în Chișinău și în toată Republica Moldova.',
  alternates: { canonical: '/servicii' },
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <>
      <Container className="pt-16 pb-12 md:pt-20 md:pb-16">
        <SectionHeading
          as="h1"
          eyebrow="Servicii"
          title="Ce decorăm și ce include fiecare serviciu"
          description="Lucrăm pe evenimente întregi, nu pe elemente separate. Mai jos e ce intră în fiecare tip de proiect, ca să știi exact ce primești înainte de a cere o ofertă."
        />
      </Container>

      <Container className="pb-20 md:pb-28">
        {services.length > 0 ? (
          <div className="flex flex-col gap-16 md:gap-24">
            {services.map((service, index) => (
              <ServiceRow
                key={service.slug}
                service={service}
                reversed={index % 2 === 1}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageOpen}
            title="Momentan nu avem servicii publicate."
            description="Revino în curând sau scrie-ne direct — răspundem la orice tip de eveniment."
            actionLabel="Scrie-ne"
            actionHref="/contact"
          />
        )}
      </Container>

      <CtaBand />
    </>
  )
}
