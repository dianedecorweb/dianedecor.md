import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, Plus } from 'lucide-react'

import DatabaseNotice from '@/components/admin/DatabaseNotice'
import RentalRow from '@/components/admin/RentalRow'
import Container from '@/components/layout/Container'
import EmptyState from '@/components/ui/EmptyState'
import { canEditContent, getAdminRentalItems } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Chirie decor',
  robots: { index: false, follow: false },
}

export default async function AdminRentalPage() {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const readOnly = !canEditContent()
  const items = await getAdminRentalItems()
  const shown = items.filter((item) => item.published).length

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl">Chirie decor</h1>
          <p className="mt-2 max-w-prose text-sm text-muted">
            {items.length} {items.length === 1 ? 'obiect' : 'obiecte'}, {shown} în catalog. Clienții
            le bifează pe site, iar lista ajunge în cererea de ofertă.
          </p>
        </div>
        <Link
          href="/admin/chirie/nou"
          aria-disabled={readOnly ? 'true' : undefined}
          className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink px-5 text-sm font-medium text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep aria-disabled:pointer-events-none aria-disabled:opacity-40"
        >
          <Plus size={16} aria-hidden="true" />
          Obiect nou
        </Link>
      </div>

      {readOnly ? (
        <div className="mt-8">
          <DatabaseNotice />
        </div>
      ) : null}

      <div className="mt-8">
        {items.length > 0 ? (
          <ul className="border border-line bg-paper">
            {items.map((item) => (
              <RentalRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Package}
            title="Catalogul e gol."
            description="Adaugă primul obiect de închiriat, cu poză și preț. Pagina /chirie-decor și linkurile spre ea apar pe site din clipa în care există unul."
            actionLabel="Obiect nou"
            actionHref="/admin/chirie/nou"
          />
        )}
      </div>
    </Container>
  )
}
