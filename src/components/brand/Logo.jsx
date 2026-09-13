import Image from 'next/image'

import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/site-config'

/** Proporțiile fișierului, ca înălțimea să nu tragă lățimea după ea greșit. */
const RATIO = 356 / 173.5

/**
 * The single source of truth for the brand mark. Nothing else in the codebase
 * renders the studio name in a visual header position.
 *
 * Logo-ul e desen liniar negru pe transparent, deci pe fundal închis ar fi
 * invizibil. `light` folosește un al doilea fișier, cu desenul ivoriu și
 * floarea păstrată roz — un filtru de inversare ar fi albit și petalele.
 *
 * `inherit` nu pune niciun filtru: peste hero comutarea o face CSS-ul din
 * `globals.css`, prin clasa `site-logo`, odată cu restul antetului. Acolo
 * rămâne inversarea în alb: e o stare trecătoare, peste o fotografie, unde
 * albul se citește mai bine decât orice culoare.
 *
 * Înălțimea implicită e generoasă pentru că lockup-ul are „DECOR" cu litere
 * rărite: sub 40px devin nelizibile.
 */
export default function Logo({ variant = 'dark', className }) {
  return (
    <Image
      src={variant === 'light' ? '/logo-light.svg' : '/logo.svg'}
      alt={siteConfig.name}
      width={Math.round(56 * RATIO)}
      height={56}
      priority
      className={cn('site-logo h-10 w-auto sm:h-12', className)}
    />
  )
}
