import { Map } from 'lucide-react'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'

export const metadata = {
  title: 'Pagina nu a fost găsită',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />

      <main className="flex-1 pt-20 flex flex-col">
        <Container className="flex flex-1 flex-col items-center justify-center gap-8 py-28 text-center md:py-32">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-line/50 text-accent">
            <Map size={48} strokeWidth={1} />
          </div>
          
          <div className="flex flex-col gap-4">
            <p className="eyebrow mx-auto text-accent">Eroare 404</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-ink">Pagina nu a fost găsită</h1>
          </div>
          
          <p className="max-w-[50ch] text-lg text-ink-soft">
            Adresa pe care ai accesat-o nu există sau a fost mutată. 
            Te invităm să explorezi restul site-ului nostru.
          </p>
          
          <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/" variant="primary">
              Pagina principală
            </Button>
            <Button href="/portofoliu" variant="secondary">
              Vezi portofoliul
            </Button>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
