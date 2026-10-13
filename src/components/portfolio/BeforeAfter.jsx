'use client'

import Image from 'next/image'
import { ChevronsLeftRight } from 'lucide-react'
import { useState } from 'react'

/**
 * Sala goală și sala decorată, una peste alta, despărțite de o linie care se
 * trage cu degetul, cu mouse-ul sau cu săgețile.
 *
 * Mânerul e un <input type="range"> nativ, invizibil, întins peste toată poza:
 * tastatura, cititoarele de ecran și atingerea vin de la browser, fără cod de
 * tras cu degetul scris de mână. `touch-action: pan-y` lasă pagina să se
 * deruleze în sus și în jos când degetul merge pe verticală.
 */
export default function BeforeAfter({ before, after, title }) {
  const [position, setPosition] = useState(50)

  return (
    <figure>
      <div className="relative aspect-4/3 w-full overflow-hidden bg-line select-none md:aspect-video">
        <Image
          src={after}
          alt={`${title}, după decor`}
          fill
          sizes="(min-width: 1280px) 1184px, 100vw"
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Image
            src={before}
            alt={`${title}, înainte de decor`}
            fill
            sizes="(min-width: 1280px) 1184px, 100vw"
            quality={85}
            className="object-cover"
          />
        </div>

        <span className="absolute top-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-xs tracking-[0.14em] text-ivory uppercase">
          Înainte
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs tracking-[0.14em] text-ivory uppercase">
          După
        </span>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Compară sala înainte și după decor"
          aria-valuetext={`${position}% înainte`}
          className="peer absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
          style={{ touchAction: 'pan-y' }}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ivory shadow-[0_0_0_1px_rgba(30,27,24,0.25)] peer-focus-visible:[&>span]:ring-2 peer-focus-visible:[&>span]:ring-accent"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory text-ink shadow-[0_4px_16px_-4px_rgba(30,27,24,0.5)]">
            <ChevronsLeftRight size={20} />
          </span>
        </span>
      </div>
      <figcaption className="mt-3 text-sm text-muted">
        Trage de linie ca să vezi sala înainte și după decor.
      </figcaption>
    </figure>
  )
}
