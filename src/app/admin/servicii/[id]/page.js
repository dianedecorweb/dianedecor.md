import { notFound, redirect } from 'next/navigation'

import ServiceForm from '@/components/admin/ServiceForm'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import { canEditContent, getAdminService } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { isValidObjectId } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Editare serviciu',
  robots: { index: false, follow: false },
}

export default async function EditServicePage({ params }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const { id } = await params
  const editable = canEditContent()
  // Prisma throws on a malformed ObjectId; a bad link is simply not found.
  if (editable && !isValidObjectId(id)) notFound()

  const service = await getAdminService(id)
  if (!service) notFound()

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Servicii', href: '/admin/servicii' },
          { label: service.title, href: `/admin/servicii/${id}` },
        ]}
      />
      <h1 className="mt-6 text-4xl">{service.title}</h1>
      <div className="mt-10">
        <ServiceForm service={service} readOnly={!editable} />
      </div>
    </Container>
  )
}
