import { Phone } from 'lucide-react'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import { siteConfig } from '@/lib/site-config'

export default function CtaBand({
  t,
  title = t.home.ctaTitle,
  description = t.home.ctaText,
  ctaHref = '/contact',
}) {
  return (
    <section aria-labelledby="cta-band-title" className="bg-ink text-ivory">
      <Container className="flex flex-col items-start gap-8 py-14 md:py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2 id="cta-band-title" className="max-w-[18ch] text-ivory">
            {title}
          </h2>
          <p className="max-w-[52ch] text-ivory/70">{description}</p>
        </div>

        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
          <Button href={ctaHref} variant="inverse">
            {t.layout.requestOffer}
          </Button>
          <a
            href={siteConfig.phoneHref}
            className="inline-flex h-12 items-center justify-center gap-2 text-sm tracking-[0.02em] text-ivory transition-colors duration-200 ease-out hover:text-accent"
          >
            <Phone size={16} aria-hidden="true" />
            {siteConfig.phone}
          </a>
        </div>
      </Container>
    </section>
  )
}
