import { redirect } from 'next/navigation'

import DatabaseNotice from '@/components/admin/DatabaseNotice'
import Container from '@/components/layout/Container'
import { canEditContent, getAdminStats } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'
import { SOURCE_LABELS, STATUS_LABELS } from '@/lib/message-status'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Statistici',
  robots: { index: false, follow: false },
}

const CHANNEL_LABELS = { phone: 'Apeluri', instagram: 'Mesaje pe Instagram' }
const CLICK_SOURCE_LABELS = { fereastra: 'din fereastra de la intrare', buton: 'din butonul flotant' }

function percent(part, whole) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}

/** O listă de bare orizontale: se citește la fel pe telefon și pe ecran mare. */
function Bars({ rows, total, formatLabel = (label) => label }) {
  const max = Math.max(1, ...rows.map((row) => row.count))
  return (
    <ul className="mt-5 flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1">
          <span className="truncate text-sm text-ink">{formatLabel(row.label)}</span>
          <span className="text-sm text-ink-soft tabular-nums">
            {row.count}
            {total ? <span className="text-muted"> · {percent(row.count, total)}%</span> : null}
          </span>
          <span className="col-span-2 h-2 overflow-hidden rounded-full bg-line">
            <span
              className="block h-full rounded-full bg-accent"
              style={{ width: `${Math.max(2, (row.count / max) * 100)}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}

function Card({ title, hint, children }) {
  return (
    <section className="border border-line bg-paper p-5 md:p-6">
      <h2 className="font-display text-2xl">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      {children}
    </section>
  )
}

export default async function AdminStatsPage() {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const stats = await getAdminStats()
  const contacted = stats.byStatus.CONTACTED ?? 0
  const maxMonth = Math.max(1, ...stats.months.map((month) => month.count))

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <h1 className="text-4xl">Statistici</h1>
      <p className="mt-2 text-sm text-muted">
        Cererile din ultimele 12 luni și apăsările din ultimele 30 de zile.
      </p>

      {!canEditContent() ? (
        <div className="mt-8">
          <DatabaseNotice />
        </div>
      ) : null}

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
        {[
          ['Cereri, 12 luni', stats.total],
          ['Necitite', stats.byStatus.NEW ?? 0],
          ['Clienți contactați', `${percent(contacted, stats.total)}%`],
          ['Apăsări, 30 de zile', stats.clickTotal],
        ].map(([label, value]) => (
          <div key={label} className="bg-paper p-5">
            <dt className="text-xs tracking-[0.14em] text-muted uppercase">{label}</dt>
            <dd className="mt-2 font-display text-4xl text-ink tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Cereri pe lună" hint="Câte cereri au venit prin formular în fiecare lună.">
          <ol className="mt-6 flex h-44 items-end gap-1.5" aria-label="Cereri pe lună">
            {stats.months.map((month) => (
              <li key={month.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[11px] text-ink-soft tabular-nums">{month.count || ''}</span>
                <span
                  className="w-full rounded-t-[2px] bg-accent"
                  style={{ height: `${month.count ? Math.max(4, (month.count / maxMonth) * 100) : 1}%` }}
                  title={`${month.label}: ${month.count}`}
                />
                <span className="w-full truncate text-center text-[10px] text-muted">{month.label}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Ce se cere" hint="Tipul evenimentului din fiecare cerere.">
          {stats.byType.length ? <Bars rows={stats.byType} total={stats.total} /> : <Empty />}
        </Card>

        <Card title="De unde vin cererile" hint="Ce a apăsat vizitatorul înainte să completeze formularul.">
          {stats.bySource.length ? (
            <Bars
              rows={stats.bySource}
              total={stats.total}
              formatLabel={(label) => {
                const text = SOURCE_LABELS[label] ?? label
                return text.charAt(0).toUpperCase() + text.slice(1)
              }}
            />
          ) : (
            <Empty />
          )}
        </Card>

        <Card
          title="Apeluri și Instagram"
          hint="Apăsări pe telefon și pe Instagram din fereastra de la intrare și din butonul flotant. Apelul în sine nu se poate număra, doar intenția."
        >
          {stats.clicks.length ? (
            <Bars
              rows={stats.clicks.map((row) => ({
                label: `${CHANNEL_LABELS[row.channel]} ${CLICK_SOURCE_LABELS[row.source]}`,
                count: row.count,
              }))}
              total={stats.clickTotal}
            />
          ) : (
            <Empty text="Încă nicio apăsare înregistrată." />
          )}
        </Card>

        <Card title="Ce s-a întâmplat cu cererile" hint="Starea curentă a cererilor din ultimele 12 luni.">
          <Bars
            rows={Object.entries(stats.byStatus).map(([status, count]) => ({ label: status, count }))}
            total={stats.total}
            formatLabel={(status) => STATUS_LABELS[status]}
          />
        </Card>
      </div>
    </Container>
  )
}

function Empty({ text = 'Încă nicio cerere.' }) {
  return <p className="mt-5 text-sm text-muted">{text}</p>
}
