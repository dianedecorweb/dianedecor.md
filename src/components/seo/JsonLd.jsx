import { localePath } from '@/i18n/config'
import { getSiteUrl, siteConfig } from '@/lib/site-config'

/** Renders one JSON-LD block. Data is built by the helpers below. */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

/** `t` e dicționarul limbii paginii: descrierea și țara se dau în limba ei. */
export function localBusinessSchema(t) {
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#studio`,
    name: siteConfig.name,
    description: t.meta.description,
    url: `${siteUrl}${localePath(t.lang, '/')}`,
    telephone: siteConfig.phoneHref.replace('tel:', ''),
    email: siteConfig.email,
    image: `${siteUrl}/images/og-image.jpg`,
    priceRange: 'MDL',
    areaServed: {
      '@type': 'Country',
      name: t.meta.country,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.city,
      addressCountry: 'MD',
    },
    sameAs: [siteConfig.socials.instagram, siteConfig.socials.facebook],
  }
}

export function breadcrumbSchema(items, lang = 'ro') {
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${siteUrl}${localePath(lang, item.href)}`,
    })),
  }
}
