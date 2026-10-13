import { MessageCircle, Phone } from 'lucide-react'
import { Suspense } from 'react'

import ContactDetails from '@/components/contact/ContactDetails'
import ContactForm, { ContactFormFromUrl } from '@/components/contact/ContactForm'
import FaqAccordion from '@/components/contact/FaqAccordion'
import Container from '@/components/layout/Container'
import SectionHeading from '@/components/layout/SectionHeading'
import { getDictionary } from '@/i18n'
import { alternatesFor } from '@/i18n/config'
import { getRentalItems } from '@/lib/queries'
import { siteConfig } from '@/lib/site-config'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  return {
    title: t.contact.metaTitle,
    description: t.contact.metaDescription,
    alternates: alternatesFor(lang, '/contact'),
  }
}

/**
 * Statică, servită din cache ca restul site-ului: parametrii din adresă
 * (`?tip=`, `?din=`, `?obiecte=`) îi citește formularul în browser. Până atunci
 * se vede același formular, gol, deci pagina nu sare la încărcare.
 */
export default async function ContactPage({ params }) {
  const t = getDictionary((await params).lang)
  const rentalNames = Object.fromEntries((await getRentalItems(t.lang)).map((item) => [item.slug, item.name]))

  return (
    <>
      <Container className="pt-16 pb-12 md:pt-20 md:pb-16">
        <SectionHeading
          as="h1"
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          description={t.contact.text}
        />
      </Container>

      <Container className="pb-24 md:pb-32">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h2 className="sr-only">{t.contact.formHeading}</h2>
            <Suspense fallback={<ContactForm />}>
              <ContactFormFromUrl rentalNames={rentalNames} />
            </Suspense>
          </div>

          <div>
            <ContactDetails t={t} />
          </div>
        </div>

        <div className="mt-20 border-t border-line pt-16">
          <FaqAccordion title={t.contact.faqTitle} items={t.content.faq} />
        </div>
      </Container>

      {/* Persistent call bar, only on this page and only on small screens. */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-ivory/95 backdrop-blur-sm md:hidden">
        <a
          href={siteConfig.phoneHref}
          className="inline-flex h-14 items-center justify-center gap-2 text-sm font-medium text-ink"
        >
          <Phone size={18} aria-hidden="true" />
          {t.contact.call}
        </a>
        <a
          href={siteConfig.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 items-center justify-center gap-2 border-l border-line bg-ink text-sm font-medium text-ivory"
        >
          <MessageCircle size={18} aria-hidden="true" />
          {t.contact.whatsapp}
        </a>
      </div>
      <div aria-hidden="true" className="h-14 md:hidden" />
    </>
  )
}
