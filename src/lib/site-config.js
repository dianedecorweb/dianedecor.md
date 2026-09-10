/**
 * Static studio data. Everything here is public information that never changes
 * per request, so it lives in code rather than in the database.
 */

export const siteConfig = {
  name: 'DianeDecor',
  legalName: 'DianeDecor',
  tagline: 'Studio de decor pentru evenimente',
  description:
    'Studio de decor pentru evenimente din Republica Moldova. Nunți, cumetrii, cereri în căsătorie, aniversări, cununii în aer liber, baloane cu heliu și chirie decor.',
  phone: '069 216 064',
  phoneHref: 'tel:+37369216064',
  whatsappHref: 'https://wa.me/37369216064',
  email: 'diane.decor.web@gmail.com',
  emailHref: 'mailto:diane.decor.web@gmail.com',
  city: 'Chișinău',
  serviceArea: 'Chișinău și toată Republica Moldova',
  workingHours: 'Luni – Sâmbătă, 09:00 – 19:00',
  socials: {
    instagram: 'https://www.instagram.com/dianedecor.md',
    facebook: 'https://www.facebook.com/share/18mYc1Fz3f/',
  },
  founded: 2016,
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export const navigation = [
  { label: 'Acasă', href: '/' },
  { label: 'Servicii', href: '/servicii' },
  { label: 'Portofoliu', href: '/portofoliu' },
  { label: 'Despre noi', href: '/despre' },
  { label: 'Contact', href: '/contact' },
]

export const studioStats = [
  { value: '5+', label: 'ani de experiență' },
  { value: '480+', label: 'evenimente decorate' },
  { value: 'Toată', label: 'țara acoperită' },
]

export const processSteps = [
  {
    title: 'Discuție inițială',
    description:
      'Ne spui data, locația și numărul de invitați. Discutăm ce îți place și care e bugetul cu care lucrăm.',
  },
  {
    title: 'Concept & ofertă',
    description:
      'Primești o propunere de concept cu paleta de culori, materialele și o ofertă detaliată pe fiecare zonă.',
  },
  {
    title: 'Pregătire',
    description:
      'Comandăm florile, pregătim structurile în atelier și confirmăm accesul în sală cu o săptămână înainte.',
  },
  {
    title: 'Montaj în ziua evenimentului',
    description:
      'Echipa ajunge devreme, montează tot decorul și rămâne până la finalul evenimentului pentru demontare.',
  },
]

export const studioValues = [
  {
    icon: 'Palette',
    title: 'Un concept, nu un catalog',
    description:
      'Nu refolosim același decor la trei evenimente pe weekend. Paleta și materialele pornesc de la sala ta și de la ce vă reprezintă.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Ofertă fără surprize',
    description:
      'Oferta include montajul, transportul și demontarea. Ce vezi în deviz este ce plătești la final.',
  },
  {
    icon: 'Truck',
    title: 'Montăm noi, peste tot',
    description:
      'Acoperim toată Republica Moldova, cu echipă și transport propriu. Nu contează cât de departe sau cât de mic e satul — nu depinzi de furnizori locali.',
  },
]

export const whyChooseUs = [
  'Vizionare a sălii înainte de a-ți trimite oferta, în Chișinău fără cost suplimentar.',
  'Un singur om de contact de la prima discuție până la demontare.',
  'Flori naturale de sezon, completate cu aranjamente reutilizabile acolo unde are sens.',
  'Structuri proprii — arcade, panouri foto, sfeșnice — nu subînchiriem de la terți.',
  'Montaj început cu minimum 4 ore înainte de sosirea invitaților.',
  'Demontare în aceeași noapte, ca sala să fie liberă dimineața.',
]

export const faqItems = [
  {
    question: 'Cu cât timp înainte trebuie să rezerv?',
    answer:
      'Pentru nunți în sezon (mai – septembrie) recomandăm 6–9 luni înainte, pentru că datele bune se ocupă primele. Pentru cumetrii, aniversări și cereri în căsătorie sunt de obicei suficiente 3–6 săptămâni. Dacă data ta e aproape, scrie-ne oricum — uneori avem disponibilitate din anulări.',
  },
  {
    question: 'Lucrați în afara Chișinăului?',
    answer:
      'Da, în toată Republica Moldova, fără excepții. Nu avem o listă de localități în care mergem și una în care nu — dacă evenimentul tău e în țară, ajungem. Am decorat în Chișinău, Bălți, Soroca, Orhei și Rezina, dar la fel de des și în sate mici, unde nu există furnizori locali. Venim cu echipă, scule și transport propriu, iar costul deplasării îl calculăm pe distanță și îl scriem în ofertă de la început, ca să nu apară nimic în plus la final.',
  },
  {
    question: 'Cât costă decorul pentru o nuntă?',
    answer:
      'Depinde de mărimea sălii, de numărul de mese și de cât de multe flori naturale intră în concept. Un decor complet de nuntă începe de regulă de la aproximativ 15 000 MDL și crește în funcție de amploare. Îți trimitem un deviz pe zone — prezidiu, mese, sală, exterior — ca să poți alege ce păstrezi și la ce renunți.',
  },
  {
    question: 'Pot alege paleta de culori?',
    answer:
      'Da, iar în majoritatea cazurilor de acolo pornim. Ne trimiți culorile rochiilor domnișoarelor de onoare, o poză din sală sau câteva imagini care îți plac, iar noi construim paleta în jurul lor și îți arătăm cum arată pe materialele reale înainte de a comanda.',
  },
  {
    question: 'Ce se întâmplă dacă evenimentul e amânat?',
    answer:
      'Avansul se transferă integral pe noua dată, dacă ne anunți cu minimum 14 zile înainte și data nouă este liberă în calendarul nostru. Dacă data nouă nu este disponibilă, îți returnăm avansul mai puțin costul materialelor deja comandate, pe care ți le predăm.',
  },
]

/**
 * Which portfolio category illustrates each service. Used on service detail
 * pages to show a strip of real projects for that kind of event.
 */
export const serviceCategoryMap = {
  'decor-nunta': 'nunti',
  'decor-cumetrie': 'cumetrii',
  'cerere-in-casatorie': 'cerere-in-casatorie',
  'decor-aniversare': 'aniversari',
  'cununie-in-aer-liber': 'cununie-in-aer-liber',
  'baloane-cu-heliu': 'aniversari',
  'chirie-decor': 'nunti',
}

/** Options for the contact form's event type select. */
export const eventTypeOptions = [
  'Decor nuntă',
  'Decor cumetrie',
  'Cerere în căsătorie',
  'Decor aniversare',
  'Cununie în aer liber',
  'Baloane cu heliu',
  'Chirie decor',
  'Altceva',
]

/** Feedback shown by the contact form and returned by POST /api/contact. */
export const formMessages = {
  success: 'Mulțumim! Am primit cererea ta. Te contactăm în cel mult 24 de ore.',
  error: 'Ceva nu a mers bine. Încearcă din nou sau sună-ne direct.',
  rateLimited: 'Ai trimis prea multe cereri. Încearcă din nou peste câteva minute.',
}
