import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

import Badge from '@/components/ui/Badge'
import { formatEventDate, toIsoDate } from '@/lib/format'

const CARD_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

export default function ProjectCard({ project, priority = false, eager = false, sizes = CARD_SIZES }) {
  const eventDate = formatEventDate(project.eventDate)

  return (
    <article className="group border border-line bg-paper transition-colors duration-200 ease-out hover:border-muted/60">
      <Link href={`/portofoliu/${project.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-line">
          <Image
            src={project.coverImage}
            alt={`Decor pentru ${project.title}${project.location ? `, ${project.location}` : ''}`}
            fill
            sizes={sizes}
            quality={85}
            priority={priority}
            loading={priority || eager ? 'eager' : 'lazy'}
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-3 p-5">
          <Badge>{project.category.name}</Badge>

          <h3 className="text-xl">{project.title}</h3>

          <div className="flex flex-col gap-1 text-sm text-muted">
            {project.clientNames ? <span>{project.clientNames}</span> : null}
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {project.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} aria-hidden="true" />
                  {project.location}
                </span>
              ) : null}
              {project.location && eventDate ? <span aria-hidden="true">·</span> : null}
              {eventDate ? <time dateTime={toIsoDate(project.eventDate)}>{eventDate}</time> : null}
            </span>
          </div>

          <span
            aria-hidden="true"
            className="mt-1 block h-px w-0 bg-accent transition-[width] duration-[400ms] ease-out group-hover:w-full"
          />
        </div>
      </Link>
    </article>
  )
}
