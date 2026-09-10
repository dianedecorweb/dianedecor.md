/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    // Client router cache. `dynamic` defaults to 0, so /contact was refetched on
    // every visit; 30s makes returning to it instant without serving stale leads.
    staleTimes: { dynamic: 30, static: 300 },
  },
  images: {
    // quality={85} is used across the site; Next 16 only serves qualities listed here.
    qualities: [75, 85],
    // WebP only. AVIF was measured at 357ms per encode against WebP's 77ms on
    // these photographs — and produced a *larger* file (37KB vs 21KB). Every
    // uncached size of every image paid that cost on its first request, which is
    // what made the gallery pages crawl.
    formats: ['image/webp'],
    // Next generates one encode per size in these lists. The defaults reach up to
    // 3840px, which nothing here ever renders — the widest container is 1280px.
    // Trimming them cuts the work the first visitor to a page pays for.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // These files never change without their filename changing, so there is no
    // reason to re-encode them every four hours.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Fiecare magazin Blob primește propriul subdomeniu, de aici wildcard-ul.
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/portofoliu',
        has: [{ type: 'query', key: 'categorie', value: '(?<categorySlug>.*)' }],
        destination: '/portofoliu/categorie/:categorySlug',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
        ],
      },
    ]
  },
}

export default nextConfig
