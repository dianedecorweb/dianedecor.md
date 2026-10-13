import { MessageCircle, Phone } from 'lucide-react'

import ContactDetails from '@/components/contact/ContactDetails'
import ContactForm from '@/components/contact/ContactForm'
import FaqAccordion from '@/components/contact/FaqAccordion'
import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import { getRentalItemsBySlugs } from '@/lib/queries'
import { serviceEventTypes, siteConfig } from '@/lib/site-config'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export const metadata = {
  title: 'Contact',
  description:
    'Cere o ofertă pentru decorul evenimentului tău. Telefon, WhatsApp și formular — răspundem în cel mult 24 de ore.',
  alternates: { canonical: '/contact' },
}

/**
 * Reading `?tip=` here makes this the one public page that renders per request
 * rather than being prerendered. That is deliberate: doing it on the client
 * instead needs a Suspense boundary whose fallback swap shifts the whole page
 * on load. Every query this page runs is cached, so the render is near-instant.
 */
export default async function ContactPage({ searchParams }) {
  const { tip, din, obiecte } = await searchParams
  let initialEventType = serviceEventTypes[tip] ?? ''
  let initialMessage = ''

  // Din catalogul de chirie: lista aleasă vine deja scrisă în mesaj. Numele
  // se citesc din bază după adresă, ca în mesaj să nu ajungă text din URL.
  if (din === 'chirie' && typeof obiecte === 'string' && obiecte) {
    const items = await getRentalItemsBySlugs(obiecte.split(','))
    if (items.length > 0) {
      initialEventType ||= serviceEventTypes['chirie-decor']
      initialMessage = `Aș vrea să închiriez:\n${items.map((item) => `• ${item.name}`).join('\n')}\n\n`
    }
  }

  return (
    <>
      <Container className="pt-16 pb-12 md:pt-20 md:pb-16">
        <SectionHeading
          as="h1"
          eyebrow="Contact"
          title="Cere o ofertă"
          description="Completează formularul sau sună-ne direct. Ne ajută mult dacă știi deja data, locația și numărul aproximativ de invitați."
        />
      </Container>

      <Container className="pb-24 md:pb-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h2 className="sr-only">Formular de contact</h2>
            <ContactForm initialEventType={initialEventType} initialMessage={initialMessage} source={din} />
          </div>

          <div>
            <ContactDetails />
          </div>
        </div>

        <div className="mt-20 border-t border-line pt-16">
          <FaqAccordion />
        </div>
      </Container>

      {/* Persistent call bar, only on this page and only on small screens. */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-ivory/95 backdrop-blur-sm md:hidden">
        <a
          href={siteConfig.phoneHref}
          className="inline-flex h-14 items-center justify-center gap-2 text-sm font-medium text-ink"
        >
          <Phone size={18} aria-hidden="true" />
          Sună acum
        </a>
        <a
          href={siteConfig.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 items-center justify-center gap-2 border-l border-line bg-ink text-sm font-medium text-ivory"
        >
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </a>
      </div>
      <div aria-hidden="true" className="h-14 md:hidden" />
    </>
  )
}
