/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Sursele de hartă din pachetul de producție nu ajută pe nimeni și se descarcă
  // de fiecare dată când cineva deschide instrumentele de dezvoltare.
  productionBrowserSourceMaps: false,
  experimental: {
    // Client router cache. `dynamic` defaults to 0, so /contact was refetched on
    // every visit; 30s makes returning to it instant without serving stale leads.
    staleTimes: { dynamic: 30, static: 300 },
    // lucide-react exportă peste o mie de iconițe dintr-un singur index. Fără
    // asta, fiecare `import { MapPin }` trage arborele întreg în graf și abia
    // apoi îl taie minificatorul.
    optimizePackageImports: ['lucide-react'],
    // 404 pentru adresele care nu ajung în nicio parte a aplicației: site-ul are
    // rădăcina sub [lang], panoul are propria rădăcină, deci nu există un layout comun.
    globalNotFound: true,
  },
  images: {
    // quality={85} is used across the site; Next 16 only serves qualities listed here.
    qualities: [75, 85],
    // WebP only. AVIF was measured at 357ms per encode against WebP's 77ms on
    // these photographs — and produced a *larger* file (37KB vs 21KB). Every
    // uncached size of every image paid that cost on its first request, which is
    // what made the gallery pages crawl.
    formats: ['image/webp'],
    // Next generează o codificare pentru fiecare mărime din listele astea, deci
    // fiecare intrare în plus e muncă plătită de primul vizitator al paginii.
    // Alese pe lățimile reale × densitatea ecranului, nu pe cifre rotunde:
    //   640  → telefon mic la 2x (Galaxy A, iPhone SE)
    //   750  → iPhone 6-8 la 2x
    //   828  → iPhone 14/15 la 2x, Pixel la 2x
    //   1080 → Galaxy S la 3x, iPhone Pro Max la 2.5x
    //   1290 → iPhone 14/15 Pro Max la 3x
    //   1536 → iPad Pro 11" la 2x
    //   1920 → laptop și desktop obișnuit
    //   2560 → desktop 1440p și MacBook la 2x
    deviceSizes: [640, 750, 828, 1080, 1290, 1536, 1920, 2560],
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
      // Româna nu are prefix. /ro/... e doar adresa internă la care duc
      // rescrierile de mai jos; cine o scrie de mână ajunge la adresa publică.
      { source: '/ro', destination: '/', permanent: true },
      { source: '/ro/:path*', destination: '/:path*', permanent: true },
      {
        source: '/ru/portofoliu',
        has: [{ type: 'query', key: 'categorie', value: '(?<categorySlug>.*)' }],
        destination: '/ru/portofoliu/categorie/:categorySlug',
        permanent: true,
      },
      {
        source: '/portofoliu',
        has: [{ type: 'query', key: 'categorie', value: '(?<categorySlug>.*)' }],
        destination: '/portofoliu/categorie/:categorySlug',
        permanent: true,
      },
    ]
  },

  /**
   * Paginile publice stau sub [lang]. Adresele românești, fără prefix, ajung
   * intern la /ro/...; vizitatorul vede tot /servicii.
   *
   * Ca tablou, rescrierile rulează după fișierele statice și rutele fixe
   * (imagini, sitemap, /admin, /api) și înaintea rutelor dinamice, deci prind
   * exact paginile publice. Excluderile acoperă căile dinamice care nu sunt
   * ale site-ului: /ru (deja cu limbă), /admin/... și /api/... cu [id].
   */
  async rewrites() {
    return [
      { source: '/', destination: '/ro' },
      {
        source: '/:path((?!ru(?:/|$)|ro(?:/|$)|admin(?:/|$)|api(?:/|$)|_next(?:/|$)).+)',
        destination: '/ro/:path',
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
