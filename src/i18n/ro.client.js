import {
  eventTypeOptions,
  formMessages,
  navigation,
  siteConfig,
} from '@/lib/site-config'

/**
 * Textele componentelor interactive, în română. Singura parte a dicționarului
 * care ajunge în codul trimis browserului; restul stă în ro.js, pe server.
 */
const roClient = {
  lang: 'ro',

  dateLocale: 'ro-RO',

  layout: {
    skipToContent: 'Sari la conținut',
    homeAria: `${siteConfig.name} — pagina principală`,
    mainNav: 'Navigare principală',
    footerNav: 'Navigare în subsol',
    menu: 'Meniu',
    openMenu: 'Deschide meniul',
    closeMenu: 'Închide meniul',
    requestOffer: 'Cere o ofertă',
    languageLabel: 'Limba site-ului',
    breadcrumbs: 'Firimituri',
  },

  nav: navigation,

  common: {
    seeDetails: 'Vezi detalii',
    priceOnRequest: 'Preț la cerere',
    all: 'Toate',
    home: 'Acasă',
    backHome: 'Înapoi la pagina principală',
    writeUs: 'Scrie-ne',
    servicePhotoAlt: (title) => `Exemplu de ${title.toLowerCase()} realizat de DianeDecor`,
    projectPhotoAlt: (title, location) => `Decor pentru ${title}${location ? `, ${location}` : ''}`,
  },

  testimonials: {
    more: 'Afișează mai multe',
    counter: (shown, total) => `${shown} din ${total} recenzii`,
  },

  lightbox: {
    open: (index, total) => `Deschide imaginea ${index} din ${total}`,
    gallery: (title) => `Galerie — ${title}`,
    close: 'Închide galeria',
    previous: 'Imaginea anterioară',
    next: 'Imaginea următoare',
    image: (title, index) => `${title} — imaginea ${index}`,
  },

  beforeAfter: {
    before: 'Înainte',
    after: 'După',
    slider: 'Compară sala înainte și după decor',
    value: (position) => `${position}% înainte`,
    beforeAlt: (title) => `${title}, înainte de decor`,
    afterAlt: (title) => `${title}, după decor`,
    caption: 'Trage de linie ca să vezi sala înainte și după decor.',
  },

  form: {
    name: 'Nume și prenume',
    phone: 'Telefon',
    email: 'Email (opțional)',
    eventType: 'Tipul evenimentului',
    choose: 'Alege...',
    eventTypeOther: 'Descrie evenimentul',
    eventTypeOtherPlaceholder: 'De exemplu: petrecere de firmă, botez...',
    eventDate: 'Data evenimentului',
    dateFree: 'Data e liberă la noi.',
    dateBooked:
      'Avem deja un eveniment în ziua asta. Scrie-ne totuși: uneori putem prelua și un decor mai mic sau te ajutăm cu o zi apropiată.',
    location: 'Locația evenimentului',
    guestCount: 'Număr aproximativ de invitați',
    message: 'Mesaj',
    messagePlaceholder: 'Spune-ne pe scurt ce îți dorești: sala, paleta de culori, ce zone vrei decorate.',
    honeypot: 'Nu completa acest câmp',
    sending: 'Se trimite...',
    submit: 'Trimite cererea',
    consent: 'Trimițând formularul ești de acord să te contactăm pe telefon sau email. Vezi',
    consentLink: 'cum lucrăm',
    successTitle: 'Cererea a fost trimisă',
    another: 'Trimite altă cerere',
    rentalIntro: 'Aș vrea să închiriez:',
    eventTypes: Object.fromEntries(eventTypeOptions.map((option) => [option, option])),
    messages: formMessages,
  },

  channels: {
    title: 'Contactele noastre',
    call: 'Sună-ne',
    callWithNumber: (phone) => `Sună-ne: ${phone}`,
    instagram: 'Scrie-ne în Instagram',
    offer: 'Cere o ofertă',
    offerDetail: 'Formular, răspundem în aceeași zi',
    close: 'Închide',
  },

  popup: {
    title: 'Decor pentru evenimente în Moldova',
    text: 'Nunți, cumetrii, cereri în căsătorie și aniversări, în Chișinău și în toată țara. Spune-ne data și îți facem o propunere.',
  },

  rental: {
    metaTitle: 'Chirie decor',
    metaDescription:
      'Arcade, suporturi, vaze și alte elemente de decor de închiriat pentru nunți, cumetrii și evenimente din Chișinău și toată Moldova. Alege ce îți trebuie și cere o ofertă.',
    eyebrow: 'Chirie decor',
    title: 'Decor de închiriat pentru evenimentul tău',
    text: 'Alege ce îți trebuie, iar lista ajunge la noi odată cu cererea de ofertă. Livrăm, montăm și strângem după eveniment.',
    emptyTitle: 'Catalogul se completează.',
    emptyText: 'Până atunci, scrie-ne ce ai vrea să închiriezi și îți spunem ce avem disponibil.',
    notFound: 'Nu găsești ce cauți?',
    notFoundAfter: 'și îți spunem ce mai avem.',
    add: 'Adaugă la cerere',
    added: 'Adăugat la cerere',
    units: { zi: '/ zi', eveniment: '/ eveniment', bucata: '/ bucată' },
    selectedRegion: 'Obiecte alese',
    selected: (count) => (count === 1 ? '1 obiect ales' : `${count} obiecte alese`),
    limit: (max) => `Cel mult ${max} într-o cerere. Pentru mai multe, scrie-ne direct.`,
    clear: 'Golește',
    request: 'Cere ofertă pentru ele',
  },

  errors: {
    title: 'Ceva nu a mers bine',
    text: 'Nu am reușit să încărcăm conținutul. Încearcă din nou sau sună-ne direct.',
    retry: 'Încearcă din nou',
    portfolioTitle: 'Nu am putut încărca portofoliul',
    portfolioText: 'A apărut o problemă la încărcarea proiectelor. Încearcă din nou sau sună-ne direct.',
  },

  notFound: {
    eyebrow: 'Eroare 404',
    title: 'Pagina nu a fost găsită',
    text: 'Adresa pe care ai accesat-o nu există sau a fost mutată. Te invităm să explorezi restul site-ului nostru.',
    home: 'Pagina principală',
    portfolio: 'Vezi portofoliul',
  },
}

export default roClient
