import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Inbox } from 'lucide-react'

import MessageRow from '@/components/admin/MessageRow'
import Container from '@/components/layout/Container'
import EmptyState from '@/components/ui/EmptyState'
import { getAdminSession } from '@/lib/auth'
import { MESSAGE_STATUSES, STATUS_HINTS, STATUS_LABELS } from '@/lib/message-status'
import { getMessages } from '@/lib/queries'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mesaje primite',
  robots: { index: false, follow: false },
}

const STATUS_FILTERS = MESSAGE_STATUSES

export default async function AdminPage({ searchParams }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const { status } = await searchParams
  const activeStatus = STATUS_FILTERS.includes(status) ? status : null

  const allMessages = await getMessages()

  const counts = allMessages.reduce(
    (acc, message) => {
      acc.all += 1
      acc[message.status] = (acc[message.status] ?? 0) + 1
      return acc
    },
    { all: 0, NEW: 0, READ: 0, CONTACTED: 0, ARCHIVED: 0 }
  )

  const messages = activeStatus
    ? allMessages.filter((message) => message.status === activeStatus)
    : allMessages

  const { listFallbackMessages } = await import('@/lib/message-store')
  const fallbackMessages = listFallbackMessages()

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl">Mesaje primite</h1>
          <p className="mt-2 text-sm text-muted">
            {counts.all} {counts.all === 1 ? 'cerere' : 'cereri'} în total, {counts.NEW} necitite.
          </p>
        </div>

        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-[3px] border border-line px-5 text-sm text-ink transition-colors duration-200 ease-out hover:border-ink"
          >
            Ieși din cont ({session.email})
          </button>
        </form>
      </div>

      {fallbackMessages.length > 0 ? (
        <div
          role="alert"
          className="mt-8 flex items-start gap-3 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <strong>Atenție:</strong> {fallbackMessages.length}{' '}
          {fallbackMessages.length === 1 ? 'mesaj provine' : 'mesaje provin'} din sistemul de
          siguranță și nu {fallbackMessages.length === 1 ? 'este stocat' : 'sunt stocate'} în baza
          de date.
        </div>
      ) : null}

      <nav aria-label="Filtrează mesajele" className="mt-8 border-y border-line py-4">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/admin"
              aria-current={activeStatus === null ? 'true' : undefined}
              className={cn(
                'inline-flex h-10 items-center rounded-[3px] border px-4 text-sm transition-colors duration-200 ease-out',
                activeStatus === null
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-line text-ink-soft hover:border-ink'
              )}
            >
              Toate ({counts.all})
            </Link>
          </li>
          {STATUS_FILTERS.map((value) => (
            <li key={value}>
              <Link
                href={`/admin?status=${value}`}
                aria-current={activeStatus === value ? 'true' : undefined}
                className={cn(
                  'inline-flex h-10 items-center rounded-[3px] border px-4 text-sm transition-colors duration-200 ease-out',
                  activeStatus === value
                    ? 'border-ink bg-ink text-ivory'
                    : 'border-line text-ink-soft hover:border-ink'
                )}
              >
                {STATUS_LABELS[value]} ({counts[value]})
              </Link>
            </li>
          ))}
        </ul>

        {/* Ce înseamnă categoria pe care stai — numele singur nu spune, iar
            „Citit" și „Contactat" se confundă ușor. */}
        <p className="mt-3 text-sm text-muted">
          {activeStatus
            ? `${STATUS_LABELS[activeStatus]}: ${STATUS_HINTS[activeStatus]} — ${counts[activeStatus]} din ${counts.all}.`
            : `Toate cererile primite, oricare ar fi starea lor — ${counts.all} în total.`}
        </p>
      </nav>

      <div className="mt-8">
        {messages.length > 0 ? (
          <ul className="border border-line bg-paper">
            {messages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Nicio cerere în această categorie."
            description="Cererile trimise prin formularul de contact apar aici, cea mai recentă prima."
          />
        )}
      </div>
    </Container>
  )
}
