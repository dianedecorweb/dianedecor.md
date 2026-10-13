import { redirect } from 'next/navigation'

import BookedDatesManager from '@/components/admin/BookedDatesManager'
import DatabaseNotice from '@/components/admin/DatabaseNotice'
import Container from '@/components/layout/Container'
import { canEditContent, chisinauToday, getUpcomingBookedDates } from '@/lib/admin-queries'
import { isAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Calendar',
  robots: { index: false, follow: false },
}

export default async function AdminCalendarPage() {
  // Re-checked here on purpose: the proxy redirect is not the only guard.
  if (!(await isAuthenticated())) redirect('/admin/login')

  const readOnly = !canEditContent()
  const dates = await getUpcomingBookedDates()

  return (
    <Container className="px-5 py-10 md:px-8 md:py-14">
      <h1 className="text-4xl">Calendar</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Zilele în care sunteți deja rezervați. Când un client alege una dintre ele în formularul
        de contact, vede că data e ocupată. Pe site apare doar „ocupat”, nimic din notă.
      </p>

      {readOnly ? (
        <div className="mt-8">
          <DatabaseNotice />
        </div>
      ) : null}

      <div className="mt-8 max-w-3xl">
        <BookedDatesManager
          dates={dates}
          today={chisinauToday().toISOString().slice(0, 10)}
          readOnly={readOnly}
        />
      </div>
    </Container>
  )
}
