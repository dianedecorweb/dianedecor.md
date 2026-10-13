import Image from 'next/image'
import { Check } from 'lucide-react'

import CtaBand from '@/components/home/CtaBand'
import ProcessSteps from '@/components/home/ProcessSteps'
import Container from '@/components/layout/Container'
import Section from '@/components/layout/Section'
import SectionHeading from '@/components/layout/SectionHeading'
import Icon from '@/components/ui/Icon'
import { getDictionary } from '@/i18n'
import { alternatesFor } from '@/i18n/config'

// ISR: paginile publice se regenerează la 5 minute după prima cerere care le găsește expirate.
export const revalidate = 300

export async function generateMetadata({ params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  return {
    title: t.about.metaTitle,
    description: t.about.metaDescription,
    alternates: alternatesFor(lang, '/despre'),
  }
}

export default async function AboutPage({ params }) {
  const t = getDictionary((await params).lang)

  return (
    <>
      <Container className="pt-16 pb-12 md:pt-20 md:pb-16">
        <SectionHeading
          as="h1"
          eyebrow={t.about.eyebrow}
          title={t.about.title}
          description={t.about.text}
        />
      </Container>

      <Container className="pb-20 md:pb-28">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-20">
          <div className="prose-ro max-w-[68ch] text-ink-soft">
            {t.about.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="flex flex-col gap-8">
            <div className="relative aspect-4/5 w-full overflow-hidden bg-line">
              <Image
                src="/images/despre-fondator.jpg"
                alt={t.about.founderAlt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={85}
                priority
                className="object-cover"
              />
            </div>

            {/*
              Trei coloane înghesuiau etichete de două cuvinte în coloana îngustă
              din dreapta și le rupeau pe câte trei rânduri. Pe rânduri, cifra
              stă la stânga și eticheta la dreapta, aliniate pe aceeași linie.
            */}
            <dl className="divide-y divide-line border-y border-line">
              {t.content.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-baseline justify-between gap-4 py-4"
                >
                  <dd className="font-display text-3xl leading-none text-ink md:text-4xl">
                    {stat.value}
                  </dd>
                  <dt className="text-right text-xs tracking-[0.14em] text-muted uppercase">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>

      <Section labelledBy="values-title" className="border-t border-line" reveal>
        <SectionHeading id="values-title" eyebrow={t.about.valuesEyebrow} title={t.about.valuesTitle} />

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {t.content.values.map((value) => (
              <li key={value.title} className="flex flex-col gap-4 border border-line bg-paper p-6 md:p-8">
                <Icon name={value.icon} size={26} strokeWidth={1.25} aria-hidden="true" className="text-accent" />
                <h3 className="text-xl">{value.title}</h3>
                <p className="text-sm leading-[1.7] text-ink-soft">{value.description}</p>
              </li>
          ))}
        </ul>
      </Section>

      <ProcessSteps t={t} headingId="about-process-title" />

      <Section labelledBy="why-title" className="border-t border-line">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
          <SectionHeading id="why-title" eyebrow={t.about.whyEyebrow} title={t.about.whyTitle} />

          <ul className="flex flex-col gap-4">
            {t.content.why.map((reason) => (
              <li key={reason} className="flex items-start gap-3 border-b border-line pb-4 text-ink-soft">
                <Check size={18} aria-hidden="true" className="mt-1 shrink-0 text-sage" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand t={t} />
    </>
  )
}
