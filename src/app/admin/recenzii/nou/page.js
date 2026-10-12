import { redirect } from 'next/navigation'

import TestimonialForm from '@/components/admin/TestimonialForm'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import { canEditContent } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Recenzie nouă',
  robots: { index: false, follow: false },
}

export default async function NewTestimonialPage() {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Recenzii', href: '/admin/recenzii' },
          { label: 'Recenzie nouă', href: '/admin/recenzii/nou' },
        ]}
      />
      <h1 className="mt-6 text-4xl">Recenzie nouă</h1>
      <div className="mt-10">
        <TestimonialForm readOnly={!canEditContent()} />
      </div>
    </Container>
  )
}
