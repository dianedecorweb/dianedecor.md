import {
  faqItems,
  processSteps,
  siteConfig,
  studioStats,
  studioValues,
  whyChooseUs,
} from '@/lib/site-config'

import roClient from './ro.client'

/**
 * Textele site-ului în română: cele ale componentelor interactive din
 * ro.client.js, plus cele care se randează doar pe server. Conținutul care
 * exista deja în site-config e preluat de acolo, nu copiat. ru.js are
 * exact aceeași formă.
 */
const ro = {
  ...roClient,

  meta: {
    title: `${siteConfig.name} — ${siteConfig.tagline} în Republica Moldova`,
    description: siteConfig.description,
    locale: 'ro_MD',
    country: 'Republica Moldova',
  },

  footer: {
    about: `Studio de decor pentru evenimente. Nunți, cumetrii, aniversări și ceremonii în aer liber, în ${siteConfig.serviceArea}.`,
    navigation: 'Navigare',
    services: 'Servicii',
    contact: 'Contact',
    serviceArea: siteConfig.serviceArea,
    workingHours: siteConfig.workingHours,
    rights: 'Toate drepturile rezervate.',
    tagline: siteConfig.tagline,
  },

  content: {
    stats: studioStats,
    process: processSteps,
    values: studioValues,
    why: whyChooseUs,
    faq: faqItems,
  },

  home: {
    heroEyebrow: 'Studio de decor · Republica Moldova',
    heroTitle: 'Decor pentru ziua în care totul trebuie să iasă bine',
    heroText:
      'Nunți, cumetrii, cereri în căsătorie și ceremonii în aer liber. Concept, montaj și demontare, în Chișinău și în toată țara.',
    heroPortfolio: 'Vezi portofoliul',
    servicesEyebrow: 'Servicii',
    servicesTitle: 'Ce decorăm',
    servicesText:
      'De la nunți întregi până la un singur setup pentru cerere în căsătorie. Fiecare serviciu are un scop clar și o listă de ce include.',
    servicesAll: 'Vezi toate serviciile',
    featuredEyebrow: 'Portofoliu',
    featuredTitle: 'Evenimente recente',
    featuredText:
      'Patru proiecte care arată cum lucrăm: o paletă clară, materiale care rezistă și decor gândit pentru sala respectivă.',
    featuredAll: 'Vezi tot portofoliul',
    processEyebrow: 'Cum lucrăm',
    processTitle: 'Patru pași, de la prima discuție până la demontare',
    testimonialsEyebrow: 'Recenzii',
    testimonialsTitle: 'Ce spun cei cu care am lucrat',
    beforeAfterEyebrow: 'Înainte și după',
    beforeAfterTitle: 'Aceeași sală, înainte să ajungem și după',
    beforeAfterText: (title) => `${title}. Trage de linie ca să vezi diferența.`,
    beforeAfterLink: 'Vezi tot proiectul',
    ctaTitle: 'Spune-ne data și locația. Restul îl gândim noi.',
    ctaText: 'Îți răspundem în cel mult 24 de ore cu o propunere de concept și o ofertă pe zone.',
  },

  services: {
    metaTitle: 'Servicii',
    metaDescription:
      'Servicii de decor pentru nunți, cumetrii, cereri în căsătorie, aniversări, cununii în aer liber, baloane cu heliu și chirie decor, în toată Republica Moldova.',
    eyebrow: 'Servicii',
    title: 'Ce decorăm și ce include fiecare serviciu',
    text: 'Lucrăm pe evenimente întregi, nu pe elemente separate. Mai jos e ce intră în fiecare tip de proiect, ca să știi exact ce primești înainte de a cere o ofertă.',
    emptyTitle: 'Momentan nu avem servicii publicate.',
    emptyText: 'Revino în curând sau scrie-ne direct — răspundem la orice tip de eveniment.',
    unavailable: 'Serviciu indisponibil',
    includes: 'Ce include',
    rentalCatalog: 'Vezi catalogul de chirie',
    relatedProjects: 'Proiecte de acest tip',
    ctaTitle: (title) => `Vrei o ofertă pentru ${title.toLowerCase()}?`,
    ctaText: 'Scrie-ne data, locația și numărul de invitați. Îți răspundem în cel mult 24 de ore.',
  },

  portfolio: {
    metaTitle: 'Portofoliu',
    metaDescription:
      'Evenimente reale decorate de DianeDecor: nunți, cumetrii, cereri în căsătorie și ceremonii în aer liber din toată Moldova.',
    eyebrow: 'Portofoliu',
    title: 'Evenimente pe care le-am decorat',
    text: 'Fiecare proiect de mai jos este un eveniment real, cu paleta, materialele și locația lui. Filtrează după tipul de eveniment care te interesează.',
    allProjects: 'Toate proiectele',
    filterAria: 'Filtrează după tipul evenimentului',
    categoryProjects: 'Proiecte din categoria',
    categoryMetaTitle: (name) => `Portofoliu: ${name}`,
    categoryUnavailable: 'Categorie indisponibilă',
    emptyTitle: 'Momentan nu avem proiecte publicate în această categorie.',
    emptyText: 'Adăugăm proiecte noi după fiecare sezon. Între timp, poți vedea restul lucrărilor noastre.',
    emptyAction: 'Vezi toate proiectele',
  },

  project: {
    unavailable: 'Proiect indisponibil',
    eventDate: 'Data evenimentului',
    location: 'Locația',
    beforeAfter: 'Înainte și după',
    gallery: 'Galerie foto',
    neighbours: 'Alte proiecte din aceeași categorie',
    previous: 'Proiectul anterior',
    next: 'Proiectul următor',
  },

  about: {
    metaTitle: 'Despre noi',
    metaDescription:
      'DianeDecor este un studio de decor pentru evenimente din Chișinău, care lucrează din 2016 în toată Republica Moldova. Cum lucrăm și de ce.',
    eyebrow: 'Despre noi',
    title: 'Studioul din spatele decorului',
    text: `Lucrăm din ${siteConfig.founded}, din Chișinău, pentru evenimente din toată țara.`,
    story: [
      'DianeDecor a început în 2016 cu decoruri pentru cumetrii, făcute în bucătăria unui apartament din Botanica. Primele comenzi au venit de la prieteni, apoi de la prietenii lor, iar în al doilea an am închiriat primul atelier și am cumpărat primele structuri proprii.',
      'Astăzi suntem o echipă mică, cu atelier în Chișinău și transport propriu. Luăm un număr limitat de evenimente pe weekend, pentru că un decor bun cere vizionarea sălii, o discuție reală despre buget și timp de montaj care nu se face în grabă.',
      'Am decorat nunți de 210 invitați și cereri în căsătorie pe o terasă de zece metri pătrați. Diferența nu stă în amploare, ci în cât de bine se potrivește decorul cu locul și cu oamenii. De aceea începem întotdeauna cu întrebări, nu cu un catalog.',
      'Ce nu facem: nu vindem pachete standard, nu subînchiriem structuri de la terți și nu lăsăm demontarea pe seama restaurantului. Ce montăm, strângem tot noi.',
    ],
    founderAlt: 'Fondatoarea studioului DianeDecor, pregătind un aranjament floral în atelier',
    valuesEyebrow: 'Valori',
    valuesTitle: 'Trei lucruri pe care nu le negociem',
    whyEyebrow: 'De ce DianeDecor',
    whyTitle: 'Ce primești, concret',
  },

  contact: {
    metaTitle: 'Contact',
    metaDescription:
      'Cere o ofertă pentru decorul evenimentului tău. Răspundem în cel mult 24 de ore. Telefon, WhatsApp, Instagram sau formular.',
    eyebrow: 'Contact',
    title: 'Cere o ofertă',
    text: 'Completează formularul sau sună-ne direct. Ne ajută mult dacă știi deja data, locația și numărul aproximativ de invitați.',
    formHeading: 'Formular de contact',
    call: 'Sună acum',
    whatsapp: 'WhatsApp',
    detailsTitle: 'Date de contact',
    phone: 'Telefon',
    whatsappText: 'Scrie-ne pe WhatsApp',
    email: 'Email',
    area: 'Zonă de lucru',
    hours: 'Program',
    rentalIntro: 'Aș vrea să închiriez:',
    faqTitle: 'Întrebări frecvente',
  },
}

export default ro
