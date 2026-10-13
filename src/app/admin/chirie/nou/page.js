import { redirect } from 'next/navigation'

import DatabaseNotice from '@/components/admin/DatabaseNotice'
import RentalForm from '@/components/admin/RentalForm'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import Container from '@/components/layout/Container'
import { canEditContent } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Obiect nou',
  robots: { index: false, follow: false },
}

export default async function NewRentalPage() {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Chirie decor', href: '/admin/chirie' },
          { label: 'Obiect nou', href: '/admin/chirie/nou' },
        ]}
      />
      <h1 className="mt-6 text-4xl">Obiect nou</h1>
      <div className="mt-10">{canEditContent() ? <RentalForm /> : <DatabaseNotice />}</div>
    </Container>
  )
}
