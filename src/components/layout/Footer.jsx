import Link from 'next/link'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

import Logo from '@/components/brand/Logo'
import { FacebookIcon, InstagramIcon } from '@/components/brand/SocialIcons'
import Container from '@/components/layout/Container'
import { getServices } from '@/lib/queries'
import { navigation, siteConfig } from '@/lib/site-config'

function ColumnTitle({ children }) {
  return <h2 className="font-sans text-xs tracking-[0.14em] text-ivory/60 uppercase">{children}</h2>
}

export default async function Footer() {
  const services = await getServices()

  return (
    <footer className="bg-ink text-ivory">
      <Container className="grid gap-x-8 gap-y-8 border-t border-ivory/15 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo variant="light" className="h-12 sm:h-14" />
          <p className="max-w-[34ch] text-sm leading-[1.7] text-ivory/70">
            Studio de decor pentru evenimente. Nunți, cumetrii, aniversări și ceremonii în aer liber,
            în {siteConfig.serviceArea}.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[3px] border border-ivory/40 text-ivory"
            >
              <InstagramIcon size={20} />
            </a>
            <a
              href={siteConfig.socials.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[3px] border border-ivory/40 text-ivory"
            >
              <FacebookIcon size={20} />
            </a>
          </div>
        </div>

        <nav aria-label="Navigare în subsol" className="flex flex-col gap-4">
          <ColumnTitle>Navigare</ColumnTitle>
          <ul className="flex flex-col text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-ivory/80 transition-colors duration-200 ease-out hover:text-ivory"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Servicii" className="flex flex-col gap-4">
          <ColumnTitle>Servicii</ColumnTitle>
          <ul className="flex flex-col text-sm">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/servicii/${service.slug}`}
                  className="inline-flex min-h-11 items-center text-ivory/80 transition-colors duration-200 ease-out hover:text-ivory"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-4">
          <ColumnTitle>Contact</ColumnTitle>
          <ul className="flex flex-col gap-1 text-sm">
            <li>
              <a
                href={siteConfig.phoneHref}
                className="inline-flex min-h-11 items-center gap-3 py-1 text-ivory/80 transition-colors duration-200 ease-out hover:text-ivory"
              >
                <Phone size={16} aria-hidden="true" className="shrink-0" />
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={siteConfig.emailHref}
                className="inline-flex min-h-11 items-center gap-3 py-1 text-ivory/80 transition-colors duration-200 ease-out hover:text-ivory"
              >
                <Mail size={16} aria-hidden="true" className="shrink-0" />
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-start gap-3 text-ivory/80">
              <MapPin size={16} aria-hidden="true" className="mt-1 shrink-0" />
              <span>{siteConfig.serviceArea}</span>
            </li>
            <li className="flex items-start gap-3 text-ivory/80">
              <Clock size={16} aria-hidden="true" className="mt-1 shrink-0" />
              <span>{siteConfig.workingHours}</span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-ivory/15">
        <Container className="flex flex-col gap-2 py-6 text-sm text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Toate drepturile rezervate.
          </p>
          <p>{siteConfig.tagline}</p>
        </Container>
      </div>
    </footer>
  )
}
