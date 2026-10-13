import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { EyeOff, Pencil } from 'lucide-react'

import DatabaseNotice from '@/components/admin/DatabaseNotice'
import Container from '@/components/layout/Container'
import { canEditContent, getAdminServices } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { formatPriceFrom } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Servicii',
  robots: { index: false, follow: false },
}

export default async function AdminServicesPage() {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const readOnly = !canEditContent()
  const services = await getAdminServices()

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <h1 className="text-4xl">Servicii</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Prețurile „de la”, descrierile și ce include fiecare serviciu. Fiecare serviciu e legat
        de un tip de eveniment din formularul de contact, așa că aici se editează, nu se adaugă.
      </p>

      {readOnly ? (
        <div className="mt-8">
          <DatabaseNotice />
        </div>
      ) : null}

      <ul className="mt-8 border border-line bg-paper">
        {services.map((service) => (
          <li key={service.id} className="border-b border-line last:border-b-0">
            <Link
              href={`/admin/servicii/${service.id}`}
              aria-disabled={readOnly ? 'true' : undefined}
              className="flex items-center gap-4 px-4 py-4 transition-colors duration-200 ease-out hover:bg-ivory aria-disabled:pointer-events-none"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[3px] bg-line">
                {service.coverImage ? (
                  <Image src={service.coverImage} alt="" fill sizes="56px" className="object-cover" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-xl text-ink">{service.title}</span>
                  {!service.published ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <EyeOff size={12} aria-hidden="true" /> ascuns
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-sm text-ink-soft">
                  {service.priceFrom ? formatPriceFrom(service.priceFrom) : 'Preț la cerere'} ·{' '}
                  {service.features.length} lucruri incluse
                </span>
              </span>
              <Pencil size={16} aria-hidden="true" className="shrink-0 text-muted" />
              <span className="sr-only">Editează</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
