/* ---------------------------------------------------------------------------
   Every word on the site, in one shape per language.

   It is one big typed object rather than a bag of keys, so a language that is
   missing a line does not compile — a half-translated page is worse than an
   untranslated one, because the gap only shows up to the person who speaks
   that language and not to anyone checking.

   Anything that varies with a number or a name is a function, so word order
   stays the translator's business: French puts the count where French wants
   it, Arabic where Arabic wants it, and neither has to match English.
   --------------------------------------------------------------------------- */

export const LOCALES = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

/** English lives at the root; the others sit under their own prefix. */
export const DEFAULT_LOCALE: Locale = 'en';

export type Copy = {
  locale: Locale;
  /** Written direction. Arabic mirrors the whole layout. */
  dir: 'ltr' | 'rtl';
  /** How this language names itself, for the switcher. */
  endonym: string;

  /** Spelled-out counts, so "fourteen cases" stays true as the collection grows. */
  count: (n: number) => string;

  /**
   * The delivery country, which `data/site.ts` holds in English because that is
   * where the setting lives. Only the value actually set there is translated;
   * anything else comes back as written, so changing the country gives an
   * untranslated name rather than a wrong one.
   */
  countryName: (english: string) => string;

  meta: {
    tagline: string;
    description: string;
    /** The title of a case's own page. */
    caseTitle: (marque: string, model: string, site: string) => string;
    caseDescription: (marque: string, model: string, shell: string) => string;
  };

  nav: {
    collection: string;
    made: string;
    fit: string;
    delivery: string;
    questions: string;
    getInTouch: string;
    openMenu: string;
    closeMenu: string;
    language: string;
  };

  hero: {
    inStock: (n: number) => string;
    titleTop: string;
    titleBottom: string;
    lede: string;
    seeCollection: string;
    howMade: string;
    metaCollection: string;
    metaDesigns: (n: number) => string;
    metaMarques: string;
    metaShells: string;
    metaImagery: string;
    metaImageryValue: string;
    scroll: string;
    tap: string;
  };

  reel: { label: string };

  collection: {
    eyebrow: string;
    heading: (n: number) => string;
    lede: string;
    filterLabel: string;
    all: string;
  };

  card: {
    details: string;
    open: (marque: string, model: string) => string;
  };

  sheet: {
    close: string;
    chooseView: string;
    motion: string;
    tilt: string;
    photo: string;
    noteMotion: string;
    noteTilt: string;
    notePhoto: string;
    photoAlt: (marque: string, model: string) => string;
    marque: string;
    model: string;
    shell: string;
    artwork: string;
    price: string;
    priceOnRequest: string;
    onTheCase: string;
    ask: string;
    order: string;
    shipsFrom: (city: string) => string;
  };

  casePage: {
    back: string;
    more: string;
  };

  craft: {
    eyebrow: string;
    heading: string;
    lede: string;
    features: { title: string; body: string }[];
  };

  fit: {
    eyebrow: string;
    heading: string;
    lede: string;
    step: string;
    steps: { title: string; body: (n: number) => string }[];
  };

  delivery: {
    eyebrow: string;
    heading: (country: string) => string;
    lede: string;
    where: string;
    allOf: (country: string) => string;
    shipAnywhere: (country: string) => string;
    weDeliverTo: (cities: string, country: string) => string;
    payment: string;
    cashOnDelivery: string;
    cashOnDeliveryBody: string;
    howLong: string;
    howLongBody: string;
    shipping: string;
    flatRate: (country: string) => string;
    freeInCities: (cities: string) => string;
    freeHere: string;
    elsewhere: (fee: string, country: string) => string;
    flatRateFreeOver: (country: string, over: string) => string;
  };

  faq: {
    eyebrow: string;
    heading: string;
    photosQ: string;
    photosA: string;
    fitQ: string;
    fitA: string;
    orderQ: string;
    orderA: string;
    outsideQ: string;
    outsideCities: (cities: string, country: string) => string;
    outsideAnywhere: (country: string) => string;
    costQ: string;
    costFree: (cities: string, fee: string, country: string) => string;
    costFlat: (fee: string, country: string) => string;
    codQ: string;
    codA: string;
    officialQ: string;
    officialA: (site: string) => string;
  };

  contact: {
    eyebrow: string;
    heading: string;
    ledeOpen: string;
    ledeClosed: string;
    whatsapp: string;
  };

  footer: {
    disclaimer: (site: string) => string;
  };

  /** The customer's first WhatsApp message. */
  enquiry: (caseName: string, link: string) => string;
  enquiryGeneral: string;

  notFound: {
    code: string;
    heading: string;
    lede: string;
    cta: string;
  };

  order: {
    cta: string;
    title: string;
    lede: string;
    yourPhone: string;
    pickPhone: string;
    changePhone: string;
    noPhone: string;
    name: string;
    namePh: string;
    phone: string;
    phonePh: string;
    city: string;
    cityPh: string;
    address: string;
    addressPh: string;
    notes: string;
    notesPh: string;
    optional: string;
    send: string;
    sending: string;
    sentTitle: string;
    sentBody: string;
    failTitle: string;
    failBody: string;
    viaWhatsapp: string;
    close: string;
    /** The message the form hands to WhatsApp when no endpoint is set. */
    message: (f: {
      case: string; model: string; name: string; phone: string;
      city: string; address: string; notes: string; link: string;
    }) => string;
  };

  assistant: {
    open: string;
    title: string;
    subtitle: string;
    greeting: string;
    placeholder: string;
    send: string;
    close: string;
    unknown: string;
    toHuman: string;
    disclaimer: string;
  };

  backToTop: string;
};
