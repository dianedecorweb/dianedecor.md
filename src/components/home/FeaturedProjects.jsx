import Image from 'next/image'
import { MapPin } from 'lucide-react'

import Section from '@/components/layout/Section'
import SectionHeading from '@/components/layout/SectionHeading'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Link } from '@/i18n/client'

/** Four equal square tiles, matching the cards on /portofoliu. */
export default function FeaturedProjects({ projects, t }) {
  if (projects.length === 0) return null

  return (
    <Section labelledBy="featured-title" className="border-t border-line" reveal>
      <SectionHeading
        id="featured-title"
        eyebrow={t.home.featuredEyebrow}
        title={t.home.featuredTitle}
        description={t.home.featuredText}
      />

      <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {projects.slice(0, 4).map((project) => (
          <li key={project.slug}>
            <article className="group h-full">
              <Link href={`/portofoliu/${project.slug}`} className="flex h-full flex-col gap-4">
                <div className="relative aspect-square w-full overflow-hidden bg-line">
                  <Image
                    src={project.coverImage}
                    alt={t.common.projectPhotoAlt(project.title, project.location)}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    quality={85}
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Badge>{project.category.name}</Badge>
                  <h3 className="text-xl">{project.title}</h3>
                  {project.location ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                      <MapPin size={14} aria-hidden="true" />
                      {project.location}
                    </span>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="mt-1 block h-px w-0 bg-accent transition-[width] duration-[400ms] ease-out group-hover:w-full"
                  />
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Button href="/portofoliu" variant="ghost">
          {t.home.featuredAll}
        </Button>
      </div>
    </Section>
  )
}
