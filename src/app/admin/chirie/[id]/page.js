import { notFound, redirect } from 'next/navigation'

import RentalForm from '@/components/admin/RentalForm'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import { getAdminRentalItem } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { isValidObjectId } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Editare obiect',
  robots: { index: false, follow: false },
}

export default async function EditRentalPage({ params }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const { id } = await params
  if (!isValidObjectId(id)) notFound()
  const item = await getAdminRentalItem(id)
  if (!item) notFound()

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Chirie decor', href: '/admin/chirie' },
          { label: item.name, href: `/admin/chirie/${id}` },
        ]}
      />
      <h1 className="mt-6 text-4xl">{item.name}</h1>
      <div className="mt-10">
        <RentalForm item={item} />
      </div>
    </Container>
  )
}
