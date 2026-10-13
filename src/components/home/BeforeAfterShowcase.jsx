import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import Section from '@/components/layout/Section'
import SectionHeading from '@/components/layout/SectionHeading'
import BeforeAfter from '@/components/portfolio/BeforeAfter'

/** Sala goală și aceeași sală decorată, pe prima pagină. Apare doar dacă există. */
export default function BeforeAfterShowcase({ project }) {
  if (!project) return null

  return (
    <Section labelledBy="before-after-title" className="border-t border-line">
      <SectionHeading
        id="before-after-title"
        eyebrow="Înainte și după"
        title="Aceeași sală, înainte să ajungem și după"
        description={`${project.title}. Trage de linie ca să vezi diferența.`}
      />
      <div className="mt-10">
        <BeforeAfter before={project.beforeImage} after={project.coverImage} title={project.title} />
      </div>
      <Link
        href={`/portofoliu/${project.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink underline-offset-4 hover:text-accent-deep hover:underline"
      >
        Vezi tot proiectul
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </Section>
  )
}
