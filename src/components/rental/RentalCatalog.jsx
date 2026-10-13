'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, Plus, Send, X } from 'lucide-react'
import { useState, useSyncExternalStore } from 'react'

import { formatPriceFrom } from '@/lib/format'
import {
  MAX_SELECTED,
  clearSelected,
  getServerSnapshot,
  getSnapshot,
  parseSelection,
  subscribe,
  toggleSelected,
} from '@/lib/rental-selection'
import { cn } from '@/lib/utils'

const UNIT_SUFFIX = { zi: '/ zi', eveniment: '/ eveniment', bucata: '/ bucată' }

/**
 * Grila catalogului și bara de jos cu ce s-a ales. Bara duce la formularul de
 * contact cu lista deja scrisă, ca vizitatorul să nu o mai copieze de mână.
 */
export default function RentalCatalog({ items }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [limitHit, setLimitHit] = useState(false)

  // Un obiect scos între timp din catalog nu mai contează.
  const known = new Set(items.map((item) => item.slug))
  const selected = parseSelection(snapshot).filter((slug) => known.has(slug))

  const toggle = (slug) => setLimitHit(!toggleSelected(slug))

  const offerHref = `/contact?din=chirie&obiecte=${encodeURIComponent(selected.join(','))}`

  return (
    <>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const isSelected = selected.includes(item.slug)
          return (
            <li key={item.slug} className="flex flex-col">
              <div className="relative aspect-square w-full overflow-hidden bg-line">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  quality={85}
                  className="object-cover"
                />
              </div>
              <h2 className="mt-4 text-xl">{item.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {item.priceFrom !== null && item.priceFrom !== undefined
                  ? `${formatPriceFrom(item.priceFrom)} ${UNIT_SUFFIX[item.priceUnit] ?? ''}`
                  : 'Preț la cerere'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              <button
                type="button"
                onClick={() => toggle(item.slug)}
                aria-pressed={isSelected}
                className={cn(
                  'mt-4 inline-flex h-11 w-fit items-center gap-2 rounded-[3px] border px-4 text-sm font-medium transition-colors duration-200 ease-out',
                  isSelected
                    ? 'border-ink bg-ink text-ivory'
                    : 'border-line text-ink hover:border-ink'
                )}
              >
                {isSelected ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {isSelected ? 'Adăugat la cerere' : 'Adaugă la cerere'}
              </button>
            </li>
          )
        })}
      </ul>

      {selected.length > 0 ? (
        <>
          {/* Loc sub ultima linie a grilei, ca bara fixă să n-o acopere. */}
          <div aria-hidden="true" className="h-24" />
          <div
            role="region"
            aria-label="Obiecte alese"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 shadow-[0_-8px_24px_-16px_rgba(30,27,24,0.35)] backdrop-blur-sm"
          >
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3 md:px-8">
              <p className="min-w-0 flex-1 text-sm text-ink" aria-live="polite">
                <strong className="font-medium">
                  {selected.length} {selected.length === 1 ? 'obiect ales' : 'obiecte alese'}
                </strong>
                {limitHit ? (
                  <span className="block text-xs text-accent-deep">
                    Cel mult {MAX_SELECTED} într-o cerere. Pentru mai multe, scrie-ne direct.
                  </span>
                ) : null}
              </p>
              <button
                type="button"
                onClick={() => {
                  clearSelected()
                  setLimitHit(false)
                }}
                className="inline-flex h-11 items-center gap-1.5 px-2 text-sm text-muted hover:text-ink"
              >
                <X size={15} aria-hidden="true" />
                Golește
              </button>
              <Link
                href={offerHref}
                className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink px-5 text-sm font-medium text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep"
              >
                <Send size={15} aria-hidden="true" />
                Cere ofertă pentru ele
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
