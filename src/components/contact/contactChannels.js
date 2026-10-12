import { Phone, Send } from 'lucide-react'

import { InstagramIcon } from '@/components/brand/SocialIcons'
import { siteConfig } from '@/lib/site-config'

/**
 * The three ways to reach the studio, in the order a visitor is most likely to
 * use them: a call, an Instagram message, and the quote form last — it asks the
 * most of them. Shared by the entry popup and the floating launcher so the two
 * can never disagree.
 *
 * `ig.me/m/<user>` opens a message thread instead of the profile page.
 */
const instagramHandle = siteConfig.socials.instagram.replace(/\/+$/, '').split('/').pop()

export const contactChannels = [
  {
    key: 'phone',
    href: siteConfig.phoneHref,
    label: 'Sună-ne',
    shortLabel: `Sună-ne: ${siteConfig.phone}`,
    detail: siteConfig.phone,
    icon: Phone,
    tone: 'bg-pastel-sage hover:bg-pastel-sage-deep',
  },
  {
    key: 'instagram',
    href: `https://ig.me/m/${instagramHandle}`,
    label: 'Scrie-ne în Instagram',
    detail: `@${instagramHandle}`,
    icon: InstagramIcon,
    tone: 'bg-pastel-rose hover:bg-pastel-rose-deep',
    external: true,
  },
  {
    key: 'offer',
    href: '/contact',
    label: 'Cere o ofertă',
    detail: 'Formular, răspundem în aceeași zi',
    icon: Send,
    tone: 'bg-pastel-lilac hover:bg-pastel-lilac-deep',
    internal: true,
  },
]
