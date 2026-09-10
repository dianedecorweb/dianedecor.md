import AdminSidebar from '@/components/admin/AdminSidebar'
import { isAuthenticated } from '@/lib/auth'

export const metadata = {
  title: 'Administrare',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }) {
  // Cine nu e autentificat vede doar formularul de login. Meniul lateral spune
  // altfel unui străin cum e împărțit panoul și ce rute există.
  const authenticated = await isAuthenticated()

  return (
    <div className="flex min-h-dvh flex-col bg-ivory lg:flex-row">
      {authenticated ? <AdminSidebar /> : null}

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
