'use client'

import { Map } from 'lucide-react'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import { useDictionary } from '@/i18n/client'

/**
 * Pentru `notFound()` din pagini (un serviciu sau un proiect care nu există).
 * Stă în grupul (site), deci antetul și subsolul vin din layout, în limba
 * paginii. Next pune singur `noindex` pe răspunsurile 404. Adresele care nu
 * se potrivesc cu nicio rută ajung la global-not-found.js.
 */
export default function NotFound() {
  const { notFound: t } = useDictionary()

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-8 py-28 text-center md:py-32">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-line/50 text-accent">
        <Map size={48} strokeWidth={1} />
      </div>

      <div className="flex flex-col gap-4">
        <p className="eyebrow mx-auto text-accent">{t.eyebrow}</p>
        <h1 className="text-4xl text-ink md:text-5xl lg:text-6xl">{t.title}</h1>
      </div>

      <p className="max-w-[50ch] text-lg text-ink-soft">{t.text}</p>

      <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button href="/" variant="primary">
          {t.home}
        </Button>
        <Button href="/portofoliu" variant="secondary">
          {t.portfolio}
        </Button>
      </div>
    </Container>
  )
}
