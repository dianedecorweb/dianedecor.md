import Image from 'next/image'
import { Check } from 'lucide-react'

import Button from '@/components/ui/Button'
import { formatPriceFrom } from '@/lib/format'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

/** Alternating image/text row on /servicii. Stacks to a single column on mobile. */
export default function ServiceRow({ service, t, reversed = false, priority = false }) {
  const priceFrom = formatPriceFrom(service.priceFrom, t.lang)

  return (
    <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={cn('relative aspect-3/2 overflow-hidden bg-line', reversed && 'lg:order-2')}>
        <Image
          src={service.coverImage}
          alt={t.common.servicePhotoAlt(service.title)}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          quality={85}
          priority={priority}
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Icon name={service.icon} size={24} strokeWidth={1.25} aria-hidden="true" className="text-accent" />
          <h2 className="text-3xl">{service.title}</h2>
        </div>

        <p className="max-w-[58ch] text-ink-soft">{service.shortDescription}</p>

        <ul className="flex flex-col gap-2.5">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-ink-soft">
              <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-sage" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 pt-1">
          <Button href={`/servicii/${service.slug}`} variant="ghost">
            {t.common.seeDetails}
          </Button>
          {priceFrom ? <span className="text-sm whitespace-nowrap text-muted">{priceFrom}</span> : null}
        </div>
      </div>
    </article>
  )
}
