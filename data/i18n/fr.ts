import type { Copy } from './types';

const MOTS = [
  'zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit',
  'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze',
  'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt',
];

const mot = (n: number) => MOTS[n] ?? String(n);
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const fr: Copy = {
  locale: 'fr',
  dir: 'ltr',
  endonym: 'Français',

  count: mot,
  countryName: (english) => ({ Morocco: 'Maroc' })[english] ?? english,

  meta: {
    tagline: 'Coques de téléphone automobiles',
    description:
      'Une collection de coques de téléphone aux illustrations automobiles. ' +
      'De vraies photos des produits, aucun rendu.',
    caseTitle: (marque, model, site) => `${marque} ${model} — ${site}`,
    caseDescription: (marque, model, shell) =>
      `Coque de téléphone ${marque} ${model}, ${shell.toLowerCase()}.`,
  },

  nav: {
    collection: 'Collection',
    made: 'Fabrication',
    fit: 'Compatibilité',
    delivery: 'Livraison',
    questions: 'Questions',
    getInTouch: 'Nous contacter',
    openMenu: 'Menu',
    closeMenu: 'Fermer',
    language: 'Langue',
  },

  hero: {
    inStock: (n) => (n === 1 ? '1 coque disponible' : `${n} coques disponibles`),
    titleTop: 'Roulez avec,',
    titleBottom: 'sur votre téléphone.',
    lede:
      'Des illustrations automobiles imprimées bord à bord sur une coque rigide. ' +
      'Chaque coque de ce site est montrée dans sa propre photo — ce que vous voyez ' +
      'est la coque que vous recevez.',
    seeCollection: 'Voir la collection',
    howMade: 'Comment elles sont faites',
    metaCollection: 'Collection',
    metaDesigns: (n) => (n === 1 ? '1 modèle' : `${n} modèles`),
    metaMarques: 'Marques',
    metaShells: 'Coques',
    metaImagery: 'Images',
    metaImageryValue: 'De vraies photos, aucun rendu',
    scroll: 'DÉFILER',
    tap: 'Touchez',
  },

  reel: { label: 'La collection en mouvement' },

  collection: {
    eyebrow: 'La collection',
    heading: (n) => `${maj(mot(n))} voitures. ${maj(mot(n))} coques.`,
    lede:
      'Ouvrez une coque pour le détail de l’illustration, une rotation 3D que vous ' +
      'pilotez, et la photo du produit telle quelle.',
    filterLabel: 'Filtrer par marque',
    all: 'Toutes',
  },

  card: {
    details: 'Détails',
    open: (marque, model) => `${marque} ${model} — voir les détails`,
  },

  sheet: {
    close: 'Fermer',
    chooseView: 'Choisir une vue',
    motion: 'Animation',
    tilt: '3D',
    photo: 'Vraie photo',
    noteMotion:
      'L’animation est la photo même de cette coque, éclairée sur un fond studio. ' +
      'L’illustration n’est jamais retouchée.',
    noteTilt:
      'La vue 3D est la photo même de cette coque en pleine résolution, tournée à ' +
      'gauche et à droite. Rien n’est redessiné ni recalculé.',
    notePhoto: 'Voici la photo d’origine, non retouchée, de cette coque exacte.',
    photoAlt: (marque, model) =>
      `Photo non retouchée de la coque ${marque} ${model}`,
    marque: 'Marque',
    model: 'Modèle',
    shell: 'Coque',
    artwork: 'Illustration',
    price: 'Prix',
    priceOnRequest: 'Prix sur demande',
    onTheCase: 'Sur la coque',
    ask: 'Demander pour cette coque',
    order: 'Commander sur WhatsApp',
    shipsFrom: (city) => ` Expédition depuis ${city}.`,
  },

  casePage: {
    back: 'Toutes les coques',
    more: 'Voir le reste de la collection',
  },

  craft: {
    eyebrow: 'Fabrication',
    heading: 'Ce que vous tenez vraiment.',
    lede:
      'Aucun rendu, aucune photo de studio empruntée. Chaque coque ici a été ' +
      'photographiée telle qu’elle est expédiée, et les détails ci-dessous sont ceux ' +
      'que vous pouvez voir sur ces photos.',
    features: [
      {
        title: 'Coque en deux parties',
        body:
          'Un dos rigide imprimé, entouré d’un cadre souple. La jointure et les côtés ' +
          'moulés sont visibles sur chaque photo de cette page.',
      },
      {
        title: 'Rebord d’appareil photo surélevé',
        body:
          'L’ouverture de l’appareil dépasse des objectifs : ce n’est donc pas le verre ' +
          'qui touche la table quand vous posez le téléphone.',
      },
      {
        title: 'Boutons couverts',
        body:
          'Le volume et l’alimentation sont couverts par des boutons moulés plutôt que ' +
          'laissés à nu — visibles sur les bords gauche et droit de chaque coque.',
      },
      {
        title: 'Impression jusqu’au bord',
        body:
          'L’illustration couvre toute la hauteur du dos et épouse la courbe : le motif ' +
          'ne s’arrête pas sur une bordure.',
      },
    ],
  },

  fit: {
    eyebrow: 'Compatibilité',
    heading: 'Taillée pour votre téléphone, pas adaptée à lui.',
    lede:
      'Chaque coque est faite pour un modèle précis : le contour de l’appareil photo, ' +
      'les boutons et le port tombent exactement en face. Dites-nous le téléphone et ' +
      'nous confirmons que le motif existe pour lui.',
    step: 'ÉTAPE',
    steps: [
      {
        title: 'Choisissez le motif',
        body: (n) => `Parmi les ${mot(n)} coques de la collection ci-dessus.`,
      },
      {
        title: 'Envoyez votre modèle',
        body: () =>
          'Écrivez-nous le modèle exact de votre téléphone — l’impression est faite ' +
          'pour chaque appareil.',
      },
      {
        title: 'Nous confirmons',
        body: () =>
          'Nous revenons vers vous avec la disponibilité et le prix avant toute ' +
          'fabrication.',
      },
    ],
  },

  delivery: {
    eyebrow: 'Livraison',
    heading: (country) => `Partout au ${country}.`,
    lede:
      'Écrivez-nous avec la coque et le modèle de votre téléphone. Nous confirmons ' +
      'd’abord la disponibilité et le prix — vous ne vous engagez qu’une fois les deux ' +
      'connus.',
    where: 'Où',
    allOf: (country) => `Tout le ${country}`,
    shipAnywhere: (country) =>
      `Nous livrons partout au ${country}. Dites-nous votre ville et nous confirmons.`,
    weDeliverTo: (cities, country) =>
      `Nous livrons à ${cities}. Ailleurs au ${country} ? Demandez-nous.`,
    payment: 'Paiement',
    cashOnDelivery: 'Paiement à la livraison',
    cashOnDeliveryBody:
      'Payez le livreur quand la coque vous parvient. Rien à l’avance, aucune carte ' +
      'nécessaire.',
    howLong: 'Délai',
    howLongBody: 'Délai habituel une fois votre commande confirmée.',
    shipping: 'Frais de port',
    flatRate: (country) => `Tarif unique partout au ${country}.`,
    flatRateFreeOver: (country, over) =>
      `Tarif unique partout au ${country}. Gratuit au-delà de ${over}.`,
  },

  faq: {
    eyebrow: 'Questions',
    heading: 'Avant de demander.',
    photosQ: 'Les photos sont-elles les vraies coques ?',
    photosA:
      'Oui. Chaque coque est photographiée telle qu’elle est expédiée. Ouvrez une coque ' +
      'et l’onglet « Vraie photo » montre le cliché d’origine, non retouché — ' +
      'l’illustration n’est jamais modifiée.',
    fitQ: 'Est-ce que ça ira sur mon téléphone ?',
    fitA:
      'Chaque coque est faite pour un modèle précis : le contour de l’appareil photo, ' +
      'les boutons et le port tombent exactement en face. Envoyez-nous votre modèle ' +
      'exact et nous confirmons que le motif existe pour lui avant toute fabrication.',
    orderQ: 'Comment commander ?',
    orderA:
      'Écrivez-nous avec la coque voulue et le modèle de votre téléphone. Nous revenons ' +
      'avec la disponibilité et le prix, puis nous organisons la livraison.',
    outsideQ: 'Livrez-vous en dehors de ma ville ?',
    outsideCities: (cities, country) =>
      `Nous livrons régulièrement à ${cities}, et ailleurs au ${country} sur demande. ` +
      'Dites-nous où vous êtes.',
    outsideAnywhere: (country) =>
      `Nous livrons partout au ${country}. Dites-nous votre ville et nous confirmons.`,
    codQ: 'Puis-je payer à la livraison ?',
    codA:
      'Oui — paiement à la livraison. Vous payez le livreur quand la coque arrive.',
    officialQ: 'Sont-ce des produits officiels BMW, Porsche ou Mercedes ?',
    officialA: (name) =>
      'Non. Ce sont des coques indépendantes imprimées avec des illustrations ' +
      'automobiles. Les noms et logos des marques présents dans les motifs ' +
      'appartiennent à leurs constructeurs, et ' +
      `${name} n’est ni affilié à aucun d’eux ni approuvé par eux.`,
  },

  contact: {
    eyebrow: 'Nous contacter',
    heading: 'Vous avez trouvé la vôtre ?',
    ledeOpen:
      'Dites-nous quelle coque vous a plu et quel téléphone vous avez. Nous revenons ' +
      'vers vous avec la disponibilité et le prix.',
    ledeClosed:
      'Notre ligne de commande est en cours d’installation. Les coordonnées ' +
      'apparaîtront ici très bientôt — la collection ci-dessus est bien en ligne.',
    whatsapp: 'WhatsApp',
  },

  footer: {
    disclaimer: (name) =>
      'Les photos de ce site montrent les coques réelles telles qu’elles sont ' +
      'fournies. Les noms de véhicules, désignations de modèles et logos de marques ' +
      'figurant dans les illustrations imprimées sont la propriété de leurs ' +
      `constructeurs respectifs ; ${name} n’est ni affilié à aucun d’eux, ni approuvé ` +
      'ni parrainé par eux.',
  },

  enquiry: (caseName, link) =>
    `Bonjour ! Je suis intéressé(e) par la coque ${caseName}. ${link}`,
  enquiryGeneral: 'Bonjour ! J’ai une question sur vos coques.',

  notFound: {
    code: '404',
    heading: 'Cette page n’est pas là.',
    lede:
      'Le lien est peut-être ancien, ou la coque a été retirée. Toute la ' +
      'collection est ci-dessous — la liste n’est pas longue.',
    cta: 'Voir la collection',
  },

  order: {
    cta: 'Commander cette coque',
    title: 'Votre commande',
    lede: 'Choisissez votre iPhone et dites-nous où l’envoyer. Nous confirmons avant toute fabrication.',
    yourPhone: 'Votre iPhone',
    pickPhone: 'Choisissez votre modèle',
    noPhone: 'Choisissez d’abord votre iPhone.',
    name: 'Nom',
    namePh: 'Votre nom complet',
    phone: 'Téléphone',
    phonePh: '06 12 34 56 78',
    city: 'Ville',
    cityPh: 'Casablanca',
    address: 'Adresse',
    addressPh: 'Rue, numéro, ce qu’il faut au livreur',
    notes: 'Autre chose',
    notesPh: 'Une question, une heure de livraison, une autre coque…',
    optional: 'facultatif',
    send: 'Envoyer la commande',
    sending: 'Envoi…',
    sentTitle: 'Commande reçue',
    sentBody: 'C’est bien arrivé. Nous revenons vers vous sur WhatsApp pour confirmer la disponibilité et le prix avant toute fabrication.',
    failTitle: 'L’envoi n’a pas abouti',
    failBody: 'Envoyez-la sur WhatsApp — rien n’est perdu, tout ce que vous avez tapé est déjà dans le message.',
    viaWhatsapp: 'Envoyer sur WhatsApp',
    close: 'Fermer',
    message: (f) =>
      `Nouvelle commande

Coque : ${f.case}
iPhone : ${f.model}

Nom : ${f.name}
Téléphone : ${f.phone}
Ville : ${f.city}
Adresse : ${f.address}` +
      (f.notes ? `
Remarques : ${f.notes}` : '') + `

${f.link}`,
  },

  backToTop: 'Retour en haut',
};
