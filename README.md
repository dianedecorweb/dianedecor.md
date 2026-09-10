# DianeDecor

Site de prezentare pentru un studio de decor pentru evenimente din Republica Moldova:
nunți, cumetrii, cereri în căsătorie, aniversări, cununii în aer liber, baloane cu
heliu și chirie decor.

Fără magazin online, fără coș, fără conturi de utilizator. Un singur scop: vizitatorul
vede lucrările, înțelege serviciile și trimite o cerere de ofertă.

## Stack

- **Next.js 16** (App Router, Turbopack) — JavaScript, fără TypeScript în codul aplicației
- **Tailwind CSS v4** — tokenii de design sunt în `@theme`, în `src/app/globals.css`
- **Prisma 6** + **MongoDB** (Atlas)
- **lucide-react** pentru icoane, **next/font** pentru fonturi (self-hosted)
- **zod** pentru validarea formularului, **clsx** pentru clase condiționate

TypeScript este configurat (`tsconfig.json`, `allowJs: true`), dar nefolosit: poți adăuga
oricând un fișier `.ts`/`.tsx` fără nicio migrare.

## Instalare

```bash
npm install
cp .env.example .env.local     # apoi completează valorile
npx prisma generate
```

### Variabile de mediu

| Variabilă | Obligatorie | Descriere |
|---|---|---|
| `DATABASE_URL` | da | Connection string MongoDB Atlas |
| `NEXT_PUBLIC_SITE_URL` | da | URL-ul public, folosit în metadata, sitemap și JSON-LD |
| `ADMIN_EMAIL` | da | Emailul contului de administrare |
| `ADMIN_PASSWORD_HASH` | da | Hash scrypt al parolei, generat cu `node scripts/hash-password.js 'parola'` |
| `ADMIN_SESSION_SECRET` | da | Șir aleatoriu, minimum 16 caractere, folosit la semnarea JWT-ului de sesiune |
| `BLOB_READ_WRITE_TOKEN` | nu | Pus automat de Vercel Blob. Fără el, încărcarea de poze din admin întoarce 503 |
| `TELEGRAM_BOT_TOKEN` | nu | Botul care anunță cererile noi. Fără el, notificarea e sărită în tăcere |
| `TELEGRAM_CHAT_ID` | nu | Grupul în care ajung notificările |

`.env.local` este în `.gitignore`. Doar `.env.example` se commit-uiește.

### Baza de date

```bash
npm run db:push     # creează colecțiile și indecșii în MongoDB
npm run seed        # populează categoriile, serviciile, proiectele și recenziile
```

Seed-ul este **idempotent**: categoriile, proiectele și serviciile se fac upsert după
`slug`, recenziile se șterg și se recreează. Îl poți rula de câte ori vrei. Nu atinge
niciodată mesajele de contact.

### Rulare

```bash
npm run dev         # http://localhost:3000
npm run build
npm start
npm run lint
```

## Funcționează și fără bază de date

Până când `DATABASE_URL` indică un cluster real, **site-ul rulează complet** din conținutul
împachetat în `src/lib/content.js`. `src/lib/queries.js` încearcă întâi MongoDB și cade
pe conținutul local dacă baza de date nu e configurată sau nu răspunde — deci o pană de
Atlas nu doboară paginile publice.

Cererile din formularul de contact au aceeași plasă de siguranță: dacă scrierea în Mongo
eșuează, mesajul ajunge în `.data/contact-messages.json` (gitignored) și apare oricum în
`/admin`. Este o măsură de avarie, nu un înlocuitor pentru bază de date — pe un host cu
sistem de fișiere read-only mesajele supraviețuiesc doar cât trăiește instanța.

## Cum adaugi conținut

### Un proiect nou în portofoliu

1. Adaugă un obiect în `projects`, în `src/lib/content.js`, cu `slug` unic, `categorySlug`
   dintre cele existente și `imageCount` egal cu numărul de poze din galerie.
2. Pune fotografiile în `public/images/portfolio/` respectând convenția de nume
   (`<slug>-cover.jpg`, `<slug>-01.jpg`, …) — detalii în `public/images/README.md`.
3. `npm run seed`

Alternativ, poți adăuga documentul direct în MongoDB. Pagina apare la următoarea
revalidare (cel mult 5 minute) fără rebuild — dar `src/lib/content.js` rămâne sursa de adevăr
pentru seed, deci adaugă-l și acolo dacă vrei să supraviețuiască unui re-seed.

### Un serviciu nou

Adaugă un obiect în `services`, în `src/lib/content.js`. `icon` trebuie să fie un nume
înregistrat în `src/components/ui/Icon.jsx` — dacă folosești o icoană nouă din
lucide-react, adaug-o întâi acolo. Apoi pune imaginea în `public/images/services/<slug>.jpg`
și rulează `npm run seed`.

### Recenzii, întrebări frecvente, pași de lucru, date de contact

- Recenziile sunt în `testimonials`, în `src/lib/content.js` (merg prin seed).
- Întrebările frecvente, pașii de lucru, valorile studioului, telefonul, emailul,
  rețelele sociale și programul sunt în `src/lib/site-config.js` — conținut static, nu
  intră în baza de date. Se modifică într-un singur loc și se propagă peste tot.

## Imagini

Toate imaginile din `public/images/` sunt **placeholder-e generate automat**. Se înlocuiesc
1:1, păstrând numele fișierului — nu se schimbă niciun rând de cod. Convenția completă și
dimensiunile recomandate sunt în [`public/images/README.md`](public/images/README.md).

Pentru a regenera placeholder-ele după ce adaugi proiecte noi:

```bash
node scripts/generate-placeholders.js
```

`next.config.mjs` permite deja `res.cloudinary.com` și `images.unsplash.com` în
`images.remotePatterns`, deci poți trece pe fotografii găzduite fără să modifici configul.

## Logo

Clientul nu a livrat încă logo-ul. Wordmark-ul temporar este în
**`src/components/brand/Logo.jsx`** — singurul fișier care trebuie modificat: înlocuiește
wordmark-ul cu `<Image src="/logo.svg" … />` și gata, se propagă în header, footer, admin
și în favicon.

## Panoul de administrare

`/admin` — inbox pentru cererile din formularul de contact. Un singur cont partajat
(`ADMIN_EMAIL` + `ADMIN_PASSWORD`), fără înregistrare.

Intri scriind `/admin` în bara de adrese: dacă nu ai sesiune ești redirecționat la
`/admin/login`, iar după autentificare ajungi înapoi la `/admin`.

- Emailul și parola se compară amândouă în timp constant (`crypto.timingSafeEqual`), deci
  un email greșit nu răspunde mai repede decât o parolă greșită, iar mesajul de eroare este
  identic în ambele cazuri.
- Sesiunea este un **JWT HS256** (`{ sub, email, iat, exp }`) semnat cu
  `ADMIN_SESSION_SECRET`, păstrat într-un cookie httpOnly, `sameSite: lax`, `secure` în
  producție, valabil 7 zile. Este emis și verificat cu `node:crypto` în `src/lib/auth.js`,
  fără dependință externă. Un token modificat sau expirat este respins.
- `proxy.js` din rădăcină protejează `/admin/*` și redirecționează spre login. **Fiecare
  pagină și rută de admin re-verifică sesiunea pe server** — proxy-ul nu e singura barieră.
Panoul are două secțiuni:

**Mesaje** (`/admin`) — cererile din formularul de contact. Se filtrează după status
(Nou / Citit / Contactat / Arhivat), iar schimbarea statusului se aplică optimist și se dă
înapoi dacă cererea eșuează.

**Portofoliu** (`/admin/portofoliu`) — creare, editare și ștergere de proiecte.

- Lista arată coperta, categoria, locația, data și slug-ul fiecărui proiect, cu ciornele
  marcate distinct.
- Din listă se comută direct `publicat` și `afișat pe pagina principală`, fără să intri
  în formular.
- Ștergerea cere confirmare și nu poate fi anulată.
- Formularul (`/admin/portofoliu/nou` și `/admin/portofoliu/<id>`) acoperă toate câmpurile
  unui proiect. Slug-ul se generează din titlu cu transliterarea diacriticelor
  (`Nuntă Ana & Roman` → `nunta-ana-roman`) și primește automat un sufix numeric dacă
  ar intra în coliziune cu alt proiect.
- Galeria e o listă de căi editabile, fiecare cu miniatură live, ca să vezi imediat dacă
  o cale se rezolvă. Se acceptă căi locale (`/images/portfolio/...`) sau URL-uri https de
  pe hosturile din `images.remotePatterns`.
- După fiecare scriere se apelează `revalidatePath` pentru `/`, `/portofoliu`,
  `/sitemap.xml` și pagina proiectului, deci modificarea apare pe site imediat, fără să
  aștepți fereastra ISR de 5 minute. La redenumire se revalidează și slug-ul vechi.
- Validarea folosește o singură schemă zod (`src/lib/project-schema.js`), importată de
  formular și re-rulată în rutele API. Serverul nu are încredere în client.

**Fără `DATABASE_URL` real, secțiunea de portofoliu e read-only.** Vezi catalogul
împachetat în cod, toate câmpurile sunt dezactivate, iar rutele de scriere răspund cu
`503` și un mesaj explicit. Se deblochează singură când conectezi baza de date.

## Randare

| Rută | Mod |
|---|---|
| `/`, `/servicii`, `/despre`, `/sitemap.xml`, `/robots.txt` | static + ISR (`revalidate = 300`, adică 5 minute) |
| `/servicii/[slug]`, `/portofoliu/[slug]` | SSG prin `generateStaticParams` + ISR |
| `/portofoliu` | static + ISR |
| `/portofoliu/categorie/[slug]` | SSG prin `generateStaticParams` + ISR — o pagină per categorie |
| `/contact` | SSR — preselectarea tipului de eveniment citește `?tip=` pe server |
| `/admin`, `/api/*` | dinamic, `force-dynamic` pe dashboard |

Conținutul se actualizează fără rebuild: modifici documentul în MongoDB și pagina se
regenerează la următoarea revalidare, adică în cel mult 5 minute. Scrierile din panoul de
administrare apelează `revalidatePath`, deci apar imediat, fără să aștepți fereastra.

### De ce filtrul de portofoliu are rute proprii

Filtrul a fost inițial `?categorie=slug` citit pe server. Asta ținea `/portofoliu` în afara
cache-ului CDN — răspunsul purta `Cache-Control: no-store`, deci fiecare vizitator ajungea
până la funcția de origine, iar pagina nu era eligibilă pentru back/forward cache.

Acum fiecare categorie e o pagină prerandată la `/portofoliu/categorie/<slug>`, servită din
nodul CDN cel mai apropiat. Linkurile vechi cu `?categorie=` sunt redirecționate permanent
(308) printr-o regulă din `next.config.mjs`, deci nimic partajat anterior nu se rupe.
În plus, fiecare categorie are acum titlu, descriere și intrare proprie în sitemap.

Next adaugă mereu query-ul original la destinația unui redirect, deci un link vechi ajunge
la `/portofoliu/categorie/nunti?categorie=nunti`. Conținutul e corect, iar eticheta
`canonical` de pe pagină indică URL-ul curat, deci motoarele de căutare consolidează.

### Fonturi

Cormorant Garamond și Inter sunt **self-hosted și subsetate** la setul de caractere folosit
în română, în `src/fonts/`. Subsetul `latin-ext` de la Google acoperă toate limbile
est-europene și costa 202 KB de font blocant la primul render; cele patru fișiere subsetate
totalizează 71 KB. Se regenerează cu:

```bash
node scripts/fetch-fonts.js
```

Rulează asta din nou doar dacă setul de glife din script trebuie extins.

## Structură

```
prisma/          schema.prisma, seed.js, load-env.js
scripts/         generate-placeholders.js, fetch-fonts.js (rulate manual, nu în build)
src/fonts/       fonturile subsetate, servite prin next/font/local
src/app/         rutele; (site) = paginile publice, admin = panoul, api = route handlers
src/components/  brand, layout, ui, home, portfolio, services, contact, admin, seo
src/lib/         prisma, queries, content, site-config, validation, rate-limit, auth,
                 format, utils, message-store, fallback-content
proxy.js         protecția rutelor /admin (în Next.js 16 înlocuiește middleware.js)
```

Componentele sunt server components implicit. Sunt client components doar:
`layout/MobileNav`, `layout/ScrollState`, `portfolio/Lightbox`, `home/TestimonialsSlider`,
`contact/ContactForm`, `contact/FaqAccordion`, `admin/MessageRow` și pagina de login.
