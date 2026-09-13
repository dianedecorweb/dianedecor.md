import Image from 'next/image'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative -mt-20 flex min-h-svh items-center overflow-hidden bg-ink pt-20"
    >
      <Image
        src="/images/hero.jpg"
        alt=""
        fill
        sizes="100vw"
        quality={85}
        priority
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" />

      <Container className="relative py-16 md:py-20">
        <div className="flex max-w-3xl flex-col gap-6">
          <p className="eyebrow text-ivory/70">Studio de decor · Republica Moldova</p>

          <h1 id="hero-title" className="text-ivory">
            Decor pentru ziua în care totul trebuie să iasă bine
          </h1>

          <p className="max-w-[54ch] text-ivory/85">
            Nunți, cumetrii, cereri în căsătorie și ceremonii în aer liber. Concept, montaj și
            demontare, în Chișinău și în toată țara.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact" variant="inverse">
              Cere o ofertă
            </Button>
            <Button href="/portofoliu" variant="light">
              Vezi portofoliul
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
