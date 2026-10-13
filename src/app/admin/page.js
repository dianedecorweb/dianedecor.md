import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BellRing, Inbox, Search, X } from 'lucide-react'

import LiveRefresh from '@/components/admin/LiveRefresh'
import MessageRow from '@/components/admin/MessageRow'
import Container from '@/components/layout/Container'
import EmptyState from '@/components/ui/EmptyState'
import { chisinauToday, getAdminInbox } from '@/lib/admin-queries'
import { getAdminSession } from '@/lib/auth'
import { MESSAGE_STATUSES, STATUS_HINTS, STATUS_LABELS } from '@/lib/message-status'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mesaje primite',
  robots: { index: false, follow: false },
}

const pill = (active) =>
  cn(
    'inline-flex h-10 items-center gap-2 rounded-[3px] border px-4 text-sm transition-colors duration-200 ease-out',
    active ? 'border-ink bg-ink text-ivory' : 'border-line text-ink-soft hover:border-ink'
  )

/** Keeps the search term while switching filters, and the filter while searching. */
function href({ status, due, q }) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (due) params.set('revenit', '1')
  if (q) params.set('q', q)
  const query = params.toString()
  return query ? `/admin?${query}` : '/admin'
}

export default async function AdminPage({ searchParams }) {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const params = await searchParams
  const activeStatus = MESSAGE_STATUSES.includes(params.status) ? params.status : null
  const due = params.revenit === '1'
  const q = typeof params.q === 'string' ? params.q.slice(0, 80) : ''

  const { messages, counts, truncated } = await getAdminInbox({ status: activeStatus, q, due })
  const today = chisinauToday().toISOString().slice(0, 10)

  const { listFallbackMessages } = await import('@/lib/message-store')
  const fallbackCount = listFallbackMessages().length

  const description = due
    ? `De revenit: cereri cu data de revenire azi sau trecută, încă nearhivate — ${counts.due}.`
    : activeStatus
      ? `${STATUS_LABELS[activeStatus]}: ${STATUS_HINTS[activeStatus]} — ${counts[activeStatus]} din ${counts.all}.`
      : `Toate cererile primite, oricare ar fi starea lor — ${counts.all} în total.`

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl">Mesaje primite</h1>
          <p className="mt-2 text-sm text-muted">
            {counts.all} {counts.all === 1 ? 'cerere' : 'cereri'} în total, {counts.NEW} necitite
            {counts.due > 0 ? `, ${counts.due} de revenit` : ''}.
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

      {fallbackCount > 0 ? (
        <div
          role="alert"
          className="mt-8 flex items-start gap-3 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <strong>Atenție:</strong> {fallbackCount}{' '}
          {fallbackCount === 1 ? 'mesaj provine' : 'mesaje provin'} din sistemul de siguranță și nu{' '}
          {fallbackCount === 1 ? 'este stocat' : 'sunt stocate'} în baza de date.
        </div>
      ) : null}

      <LiveRefresh />

      <form role="search" action="/admin" className="mt-8 flex flex-wrap gap-2">
        {activeStatus ? <input type="hidden" name="status" value={activeStatus} /> : null}
        {due ? <input type="hidden" name="revenit" value="1" /> : null}
        <label htmlFor="admin-search" className="sr-only">
          Caută în mesaje
        </label>
        <span className="relative min-w-0 flex-1 basis-64">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            id="admin-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nume, telefon, email, locație sau text"
            className="h-11 w-full rounded-[3px] border border-field-line bg-paper pr-3 pl-9 text-sm text-ink"
          />
        </span>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-[3px] bg-ink px-5 text-sm font-medium text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep"
        >
          Caută
        </button>
        {q ? (
          <Link
            href={href({ status: activeStatus, due })}
            className="inline-flex h-11 items-center gap-1.5 rounded-[3px] border border-line px-4 text-sm text-ink-soft hover:border-ink"
          >
            <X size={15} aria-hidden="true" />
            Șterge căutarea
          </Link>
        ) : null}
      </form>

      <nav aria-label="Filtrează mesajele" className="mt-6 border-y border-line py-4">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href={href({ q })}
              aria-current={!activeStatus && !due ? 'true' : undefined}
              className={pill(!activeStatus && !due)}
            >
              Toate ({counts.all})
            </Link>
          </li>
          {MESSAGE_STATUSES.map((value) => (
            <li key={value}>
              <Link
                href={href({ status: value, q })}
                aria-current={activeStatus === value && !due ? 'true' : undefined}
                className={pill(activeStatus === value && !due)}
              >
                {STATUS_LABELS[value]} ({counts[value]})
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={href({ due: true, q })}
              aria-current={due ? 'true' : undefined}
              className={cn(pill(due), !due && counts.due > 0 && 'border-danger/50 text-danger')}
            >
              <BellRing size={14} aria-hidden="true" />
              De revenit ({counts.due})
            </Link>
          </li>
        </ul>

        {/* Ce înseamnă categoria pe care stai — numele singur nu spune, iar
            „Citit" și „Contactat" se confundă ușor. */}
        <p className="mt-3 text-sm text-muted">
          {q ? `Rezultate pentru „${q}". ` : ''}
          {description}
        </p>
      </nav>

      <div className="mt-8">
        {messages.length > 0 ? (
          <>
            <ul className="border border-line bg-paper">
              {messages.map((message) => (
                <MessageRow key={message.id} message={message} today={today} />
              ))}
            </ul>
            {truncated ? (
              <p className="mt-4 text-sm text-muted">
                Se văd cele mai recente 300. Folosește căutarea sau filtrele ca să le găsești pe celelalte.
              </p>
            ) : null}
          </>
        ) : (
          <EmptyState
            icon={Inbox}
            title={q ? 'Nimic găsit.' : 'Nicio cerere în această categorie.'}
            description={
              q
                ? 'Încearcă alt nume, ultimele cifre ale telefonului sau un cuvânt din mesaj.'
                : 'Cererile trimise prin formularul de contact apar aici, cea mai recentă prima.'
            }
          />
        )}
      </div>
    </Container>
  )
}
