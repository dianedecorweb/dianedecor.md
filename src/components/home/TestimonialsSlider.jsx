'use client'

import { Plus, Quote } from 'lucide-react'
import { useState } from 'react'

import { useDictionary } from '@/i18n/client'

const PAGE_SIZE = 3

/**
 * A stacked list rather than a carousel: one review per row, three at a time,
 * with a button that reveals the next three. Nothing scrolls sideways and
 * nothing is hidden behind an arrow the visitor has to discover.
 */
export default function TestimonialsSlider({ testimonials }) {
  const { testimonials: t } = useDictionary()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  if (testimonials.length === 0) return null

  const visible = testimonials.slice(0, visibleCount)
  const remaining = testimonials.length - visibleCount

  return (
    <div className="mt-12">
      <ul className="flex flex-col gap-5">
        {visible.map((testimonial) => (
          <li key={testimonial.id}>
            <figure className="flex flex-col gap-5 border border-line bg-paper p-6 md:flex-row md:items-start md:gap-8 md:p-8">
              <Quote
                size={24}
                strokeWidth={1.25}
                aria-hidden="true"
                className="shrink-0 text-accent"
              />

              <div className="flex flex-col gap-5">
                <blockquote className="max-w-[70ch] leading-[1.8] text-ink-soft">
                  {testimonial.content}
                </blockquote>

                <figcaption className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-display text-lg text-ink">{testimonial.authorName}</span>
                  <span className="eyebrow">{testimonial.eventType}</span>
                </figcaption>
              </div>
            </figure>
          </li>
        ))}
      </ul>

      {remaining > 0 ? (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="inline-flex h-12 items-center gap-2 rounded-[3px] border border-ink px-7 text-sm font-medium tracking-[0.02em] text-ink transition-colors duration-200 ease-out hover:bg-ink hover:text-ivory"
          >
            <Plus size={16} aria-hidden="true" />
            {t.more}
          </button>

          <p aria-live="polite" className="mt-3 text-sm text-muted">
            {t.counter(visible.length, testimonials.length)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
