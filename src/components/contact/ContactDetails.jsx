import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

import { FacebookIcon, InstagramIcon } from '@/components/brand/SocialIcons'
import { siteConfig } from '@/lib/site-config'

const rowClasses =
  'flex items-start gap-4 border-b border-line py-4 transition-colors duration-200 ease-out'

function DetailRow({ icon: Icon, label, children }) {
  return (
    <li className={rowClasses}>
      <Icon size={18} strokeWidth={1.5} aria-hidden="true" className="mt-1 shrink-0 text-accent" />
      <div className="flex flex-col gap-1">
        <span className="eyebrow">{label}</span>
        <span className="text-ink">{children}</span>
      </div>
    </li>
  )
}

export default function ContactDetails({ t }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl">{t.contact.detailsTitle}</h2>

      <ul className="flex flex-col border-t border-line">
        <DetailRow icon={Phone} label={t.contact.phone}>
          <a href={siteConfig.phoneHref} className="inline-flex min-h-11 items-center hover:text-accent-deep">
            {siteConfig.phone}
          </a>
        </DetailRow>

        <DetailRow icon={MessageCircle} label="WhatsApp">
          <a
            href={siteConfig.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center hover:text-accent-deep"
          >
            {t.contact.whatsappText}
          </a>
        </DetailRow>

        <DetailRow icon={Mail} label={t.contact.email}>
          <a
            href={siteConfig.emailHref}
            className="inline-flex min-h-11 items-center hover:text-accent-deep"
          >
            {siteConfig.email}
          </a>
        </DetailRow>

        <DetailRow icon={InstagramIcon} label="Instagram">
          <a
            href={siteConfig.socials.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center hover:text-accent-deep"
          >
            @dianedecor.md
          </a>
        </DetailRow>

        <DetailRow icon={FacebookIcon} label="Facebook">
          <a
            href={siteConfig.socials.facebook}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center hover:text-accent-deep"
          >
            DianeDecor
          </a>
        </DetailRow>

        <DetailRow icon={MapPin} label={t.contact.area}>
          {t.footer.serviceArea}
        </DetailRow>

        <DetailRow icon={Clock} label={t.contact.hours}>
          {t.footer.workingHours}
        </DetailRow>
      </ul>
    </div>
  )
}
