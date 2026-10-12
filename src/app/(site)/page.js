import CtaBand from '@/components/home/CtaBand'
import FeaturedProjects from '@/components/home/FeaturedProjects'
import Hero from '@/components/home/Hero'
import ProcessSteps from '@/components/home/ProcessSteps'
import ServicesPreview from '@/components/home/ServicesPreview'
import TestimonialsSlider from '@/components/home/TestimonialsSlider'
import Section from '@/components/layout/Section'
import SectionHeading from '@/components/layout/SectionHeading'
import JsonLd, { localBusinessSchema } from '@/components/seo/JsonLd'
import { getFeaturedProjects, getFeaturedTestimonials, getServices } from '@/lib/queries'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export const metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [featuredProjects, services, testimonials] = await Promise.all([
    getFeaturedProjects(4),
    getServices(),
    getFeaturedTestimonials(),
  ])

  return (
    <>
      <JsonLd data={localBusinessSchema()} />

      <Hero />
      <ServicesPreview services={services} />
      <FeaturedProjects projects={featuredProjects} />
      <ProcessSteps />

      {testimonials.length > 0 ? (
        <Section labelledBy="testimonials-title" className="border-t border-line">
          <SectionHeading
            id="testimonials-title"
            eyebrow="Recenzii"
            title="Ce spun cei cu care am lucrat"
          />
          <TestimonialsSlider testimonials={testimonials} />
        </Section>
      ) : null}

      <CtaBand />
    </>
  )
}
