import Image from 'next/image'

import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/site-config'

/** Proporțiile fișierului, ca înălțimea să nu tragă lățimea după ea greșit. */
const RATIO = 356 / 173.5

/**
 * The single source of truth for the brand mark. Nothing else in the codebase
 * renders the studio name in a visual header position.
 *
 * Logo-ul e desen liniar negru pe transparent. Peste fundal închis nu s-ar
 * vedea, așa că varianta `light` îl inversează în alb prin filtru — asta
 * păstrează un singur fișier în loc de două exportate diferit. `inherit` e
 * pentru header, care stă pe ivoriu și nu are nevoie de inversare.
 */
export default function Logo({ variant = 'dark', className }) {
  return (
    <Image
      src="/logo.svg"
      alt={siteConfig.name}
      width={Math.round(40 * RATIO)}
      height={40}
      priority
      className={cn('h-9 w-auto sm:h-10', variant === 'light' && 'brightness-0 invert', className)}
    />
  )
}
