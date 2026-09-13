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
      {/*
        Două cadre ale aceleiași fotografii, nu unul singur întins.
        Un ecran de telefon e aproape de două ori mai înalt decât lat; o
        panoramă tăiată acolo lasă o fâșie îngustă din mijloc, în care nu se mai
        înțelege ce se vede. Sub 1024px se încarcă un cadru vertical, croit din
        sursă — pragul nu e la 768 pentru că o tabletă ținută vertical pierde
        mai bine de jumătate din panoramă. `<picture>` alege unul singur, deci nu se descarcă amândouă.
      */}
      <picture>
        <source
          media="(min-width: 1024px)"
          srcSet="/images/hero.jpg"
          width={2400}
          height={1350}
        />
        <img
          src="/images/hero-portret.jpg"
          alt=""
          width={1200}
          height={2000}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
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
