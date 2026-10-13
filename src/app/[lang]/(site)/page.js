import BeforeAfterShowcase from '@/components/home/BeforeAfterShowcase'
import CtaBand from '@/components/home/CtaBand'
import FeaturedProjects from '@/components/home/FeaturedProjects'
import Hero from '@/components/home/Hero'
import ProcessSteps from '@/components/home/ProcessSteps'
import ServicesPreview from '@/components/home/ServicesPreview'
import TestimonialsSlider from '@/components/home/TestimonialsSlider'
import Section from '@/components/layout/Section'
import SectionHeading from '@/components/layout/SectionHeading'
import JsonLd, { localBusinessSchema } from '@/components/seo/JsonLd'
import { getDictionary } from '@/i18n'
import { alternatesFor } from '@/i18n/config'
import {
  getBeforeAfterShowcase,
  getFeaturedProjects,
  getFeaturedTestimonials,
  getServices,
} from '@/lib/queries'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export async function generateMetadata({ params }) {
  const { lang } = await params
  return { alternates: alternatesFor(lang, '/') }
}

export default async function HomePage({ params }) {
  const t = getDictionary((await params).lang)
  const [featuredProjects, services, testimonials, showcase] = await Promise.all([
    getFeaturedProjects(4, t.lang),
    getServices(t.lang),
    getFeaturedTestimonials(12, t.lang),
    getBeforeAfterShowcase(t.lang),
  ])

  return (
    <>
      <JsonLd data={localBusinessSchema(t)} />

      <Hero t={t} />
      <ServicesPreview services={services} t={t} />
      <FeaturedProjects projects={featuredProjects} t={t} />
      <BeforeAfterShowcase project={showcase} t={t} />
      <ProcessSteps t={t} />

      {testimonials.length > 0 ? (
        <Section labelledBy="testimonials-title" className="border-t border-line">
          <SectionHeading
            id="testimonials-title"
            eyebrow={t.home.testimonialsEyebrow}
            title={t.home.testimonialsTitle}
          />
          <TestimonialsSlider testimonials={testimonials} />
        </Section>
      ) : null}

      <CtaBand t={t} />
    </>
  )
}
