import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageSquareQuote, Plus } from 'lucide-react'

import DatabaseNotice from '@/components/admin/DatabaseNotice'
import TestimonialRow from '@/components/admin/TestimonialRow'
import Container from '@/components/layout/Container'
import EmptyState from '@/components/ui/EmptyState'
import { canEditContent, getAdminTestimonials } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Recenzii',
  robots: { index: false, follow: false },
}

export default async function AdminTestimonialsPage() {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const readOnly = !canEditContent()
  const testimonials = await getAdminTestimonials()
  const shown = testimonials.filter((testimonial) => testimonial.published).length

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl">Recenzii</h1>
          <p className="mt-2 text-sm text-muted">
            {testimonials.length} {testimonials.length === 1 ? 'recenzie' : 'recenzii'}, {shown}{' '}
            pe prima pagină a site-ului.
          </p>
        </div>

        <Link
          href="/admin/recenzii/nou"
          aria-disabled={readOnly ? 'true' : undefined}
          className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink px-5 text-sm font-medium text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep aria-disabled:pointer-events-none aria-disabled:opacity-40"
        >
          <Plus size={16} aria-hidden="true" />
          Recenzie nouă
        </Link>
      </div>

      {readOnly ? (
        <div className="mt-8">
          <DatabaseNotice />
        </div>
      ) : null}

      <div className="mt-8">
        {testimonials.length > 0 ? (
          <ul className="border border-line bg-paper">
            {testimonials.map((testimonial) => (
              <TestimonialRow key={testimonial.id} testimonial={testimonial} readOnly={readOnly} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={MessageSquareQuote}
            title="Nicio recenzie încă."
            description="Adaugă prima recenzie primită de la un client; apare pe prima pagină a site-ului."
            actionLabel="Recenzie nouă"
            actionHref="/admin/recenzii/nou"
          />
        )}
      </div>
    </Container>
  )
}
