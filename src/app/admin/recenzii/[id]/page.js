import { notFound, redirect } from 'next/navigation'

import TestimonialForm from '@/components/admin/TestimonialForm'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import { canEditContent, getAdminTestimonial } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { isValidObjectId } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Editare recenzie',
  robots: { index: false, follow: false },
}

export default async function EditTestimonialPage({ params }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const { id } = await params
  const editable = canEditContent()

  // Prisma throws on a malformed ObjectId; a bad link is simply not found.
  if (editable && !isValidObjectId(id)) notFound()

  const testimonial = await getAdminTestimonial(id)
  if (!testimonial) notFound()

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Recenzii', href: '/admin/recenzii' },
          { label: testimonial.authorName, href: `/admin/recenzii/${id}` },
        ]}
      />
      <h1 className="mt-6 text-4xl">Recenzia lui {testimonial.authorName}</h1>
      <div className="mt-10">
        <TestimonialForm testimonial={testimonial} readOnly={!editable} />
      </div>
    </Container>
  )
}
