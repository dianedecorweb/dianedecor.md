import { ArrowRight } from 'lucide-react'

import Icon from '@/components/ui/Icon'
import { Link } from '@/i18n/client'

export default function ServiceCard({ service, t }) {
  return (
    <article className="group flex h-full flex-col gap-4 border border-line bg-paper p-6 transition-colors duration-200 ease-out hover:border-muted/60 md:p-8">
      <Icon name={service.icon} size={26} strokeWidth={1.25} aria-hidden="true" className="text-accent" />

      <h3 className="text-xl">{service.title}</h3>

      <p className="flex-1 text-sm leading-[1.7] text-ink-soft">{service.shortDescription}</p>

      <Link
        href={`/servicii/${service.slug}`}
        className="inline-flex min-h-11 items-center gap-2 py-2 text-sm tracking-[0.02em] text-ink transition-colors duration-200 ease-out group-hover:text-accent-deep"
      >
        {t.common.seeDetails}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  )
}
