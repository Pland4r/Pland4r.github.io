import type { Copy } from './types';

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
];

const up = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const en: Copy = {
  locale: 'en',
  dir: 'ltr',
  endonym: 'English',

  count: (n) => WORDS[n] ?? String(n),
  countryName: (english) => english,

  meta: {
    tagline: 'Automotive phone cases',
    description:
      'A curated collection of automotive-art phone cases. Real product photography, no renders.',
    caseTitle: (marque, model, site) => `${marque} ${model} — ${site}`,
    caseDescription: (marque, model, shell) =>
      `${marque} ${model} phone case, ${shell.toLowerCase()}.`,
  },

  nav: {
    collection: 'Collection',
    made: 'Made',
    fit: 'Fit',
    delivery: 'Delivery',
    questions: 'Questions',
    getInTouch: 'Get in touch',
    openMenu: 'Menu',
    closeMenu: 'Close',
    language: 'Language',
  },

  hero: {
    inStock: (n) => `${n} cases in stock now`,
    titleTop: 'Drive it',
    titleBottom: 'on your phone.',
    lede:
      'Automotive artwork printed edge to edge on a hard shell. Every case on this ' +
      'site is shown in its own photograph — what you see is the case you get.',
    seeCollection: 'See the collection',
    howMade: 'How they are made',
    metaCollection: 'Collection',
    metaDesigns: (n) => `${n} designs`,
    metaMarques: 'Marques',
    metaShells: 'Shells',
    metaImagery: 'Imagery',
    metaImageryValue: 'Real photos, no renders',
    scroll: 'SCROLL',
    tap: 'Tap it',
  },

  reel: { label: 'The collection in motion' },

  collection: {
    eyebrow: 'The collection',
    heading: (n) => `${up(WORDS[n] ?? String(n))} cars. ${up(WORDS[n] ?? String(n))} cases.`,
    lede:
      'Open any case for the artwork breakdown, a 3D turn you can move, and the ' +
      'untouched product photo.',
    filterLabel: 'Filter by marque',
    all: 'All',
  },

  card: {
    details: 'Details',
    open: (marque, model) => `${marque} ${model} — open details`,
  },

  sheet: {
    close: 'Close',
    chooseView: 'Choose a view',
    motion: 'Motion',
    tilt: '3D',
    photo: 'Real photo',
    noteMotion:
      'The motion view is this case’s own photograph lit on a studio background. The ' +
      'artwork itself is never altered.',
    noteTilt:
      'The 3D view is this case’s own photograph at full resolution, turned left and ' +
      'right. Nothing is redrawn or re-rendered.',
    notePhoto: 'This is the original, unedited photograph of this exact case.',
    photoAlt: (marque, model) => `Unretouched photograph of the ${marque} ${model} case`,
    marque: 'Marque',
    model: 'Model',
    shell: 'Shell',
    artwork: 'Artwork',
    price: 'Price',
    priceOnRequest: 'Price on request',
    onTheCase: 'On the case',
    ask: 'Ask about this case',
    order: 'Order on WhatsApp',
    shipsFrom: (city) => ` Shipping from ${city}.`,
  },

  casePage: {
    back: 'All cases',
    more: 'See the rest of the collection',
  },

  craft: {
    eyebrow: 'Made',
    heading: 'What you are actually holding.',
    lede:
      'No renders, no borrowed studio shots. Each case here was photographed as it ' +
      'ships, and the details below are the ones you can see in those photos.',
    features: [
      {
        title: 'Two-part shell',
        body:
          'A rigid printed back with a flexible frame wrapped around it. You can see ' +
          'the seam and the moulded side sections in every photo on this page.',
      },
      {
        title: 'Raised camera lip',
        body:
          'The camera opening sits proud of the lenses, so the glass is not what meets ' +
          'the table when you put the phone down.',
      },
      {
        title: 'Covered buttons',
        body:
          'Volume and power are covered by moulded buttons rather than left as open ' +
          'cut-outs — visible along the left and right edges of each case.',
      },
      {
        title: 'Print to the edge',
        body:
          'Artwork runs the full height of the back and around the curve, so the design ' +
          'does not stop short with a border.',
      },
    ],
  },

  fit: {
    eyebrow: 'Fit',
    heading: 'Cut for your phone, not adapted to it.',
    lede:
      'Each case is made for one specific handset, so the camera surround, the buttons ' +
      'and the port line up exactly. Tell us the phone and we will confirm the design ' +
      'is available for it.',
    step: 'STEP',
    steps: [
      {
        title: 'Pick the design',
        body: (n) => `Choose from the ${WORDS[n] ?? n} cases in the collection above.`,
      },
      {
        title: 'Send your model',
        body: () => 'Message us with your exact phone model — the print is produced per handset.',
      },
      {
        title: 'We confirm',
        body: () => 'We come back to you with availability and price before anything is made.',
      },
    ],
  },

  delivery: {
    eyebrow: 'Delivery',
    heading: (country) => `Anywhere in ${country}.`,
    lede:
      'Message us with the case and your phone model. We confirm availability and ' +
      'price first — you only commit once you know both.',
    where: 'Where',
    allOf: (country) => `All of ${country}`,
    shipAnywhere: (country) =>
      `We ship anywhere in ${country}. Tell us your city and we will confirm.`,
    weDeliverTo: (cities, country) =>
      `We deliver to ${cities}. Somewhere else in ${country}? Ask us.`,
    payment: 'Payment',
    cashOnDelivery: 'Cash on delivery',
    cashOnDeliveryBody:
      'Pay the courier when the case reaches you. Nothing up front, no card needed.',
    howLong: 'How long',
    howLongBody: 'Typical delivery time once your order is confirmed.',
    shipping: 'Shipping',
    flatRate: (country) => `Flat rate anywhere in ${country}.`,
    flatRateFreeOver: (country, over) =>
      `Flat rate anywhere in ${country}. Free over ${over}.`,
  },

  faq: {
    eyebrow: 'Questions',
    heading: 'Before you ask.',
    photosQ: 'Are the photos the real cases?',
    photosA:
      'Yes. Every case is photographed as it ships. Open any case and the "Real photo" ' +
      'tab shows the original, unedited shot — the artwork is never retouched.',
    fitQ: 'Will it fit my phone?',
    fitA:
      'Each case is made for one specific handset, so the camera surround, buttons and ' +
      'port line up exactly. Send us your exact model and we will confirm the design is ' +
      'available for it before anything is made.',
    orderQ: 'How do I order?',
    orderA:
      'Message us with the case you want and your phone model. We come back with ' +
      'availability and price, then arrange delivery.',
    outsideQ: 'Do you deliver outside my city?',
    outsideCities: (cities, country) =>
      `We deliver to ${cities} regularly, and elsewhere in ${country} on request. Tell ` +
      'us where you are.',
    outsideAnywhere: (country) =>
      `We ship anywhere in ${country}. Tell us your city and we will confirm.`,
    codQ: 'Can I pay on delivery?',
    codA: 'Yes — cash on delivery. You pay the courier when the case arrives.',
    officialQ: 'Are these official BMW, Porsche or Mercedes products?',
    officialA: (name) =>
      'No. These are aftermarket cases printed with automotive artwork. The marque ' +
      'names and logos in the designs belong to their manufacturers, and ' +
      `${name} is not affiliated with or endorsed by any of them.`,
  },

  contact: {
    eyebrow: 'Get in touch',
    heading: 'Found the one?',
    ledeOpen:
      'Tell us which case caught your eye and which phone you have. We will come back ' +
      'with availability and price.',
    ledeClosed:
      'Our order line is being set up. Contact details will appear here shortly — the ' +
      'collection above is live and ready.',
    whatsapp: 'WhatsApp',
  },

  footer: {
    disclaimer: (name) =>
      'Product photography on this site shows the actual cases as supplied. Vehicle ' +
      'names, model designations and marque logos appearing in the printed artwork are ' +
      `the property of their respective manufacturers; ${name} is not affiliated with, ` +
      'endorsed by or sponsored by any of them.',
  },

  enquiry: (caseName, link) => `Hello! I am interested in the ${caseName} case. ${link}`,
  enquiryGeneral: 'Hello! I have a question about your cases.',

  notFound: {
    code: '404',
    heading: 'That page is not here.',
    lede:
      'The link may be old, or the case may have been taken down. The whole ' +
      'collection is below — it is not a long list.',
    cta: 'See the collection',
  },

  backToTop: 'Back to top',
};
