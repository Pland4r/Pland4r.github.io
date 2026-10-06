/* ---------------------------------------------------------------------------
   What the assistant can answer.

   This is a scripted helper, not a language model. It matches what someone
   types against a keyword list and replies with an answer written here — which
   is the point: every reply is one a person wrote and can stand behind, and it
   cannot invent a delivery time or a material the shop has never promised.

   The answers are the same ones in social/dm-replies.txt, so the shop says the
   same thing on the site as it does in a DM.

   Anything it does not recognise goes to WhatsApp rather than being guessed at.
   --------------------------------------------------------------------------- */

import { type Locale } from './i18n';
import { site } from './site';

export type Intent = {
  id: string;
  /** The chip label, and what a person would tap rather than type. */
  ask: Record<Locale, string>;
  /** Lowercased, accent-stripped. Any one match is enough. */
  match: Record<Locale, string[]>;
  answer: Record<Locale, (f: Facts) => string>;
};

type Facts = {
  price: string;
  country: Record<Locale, string>;
  models: number;
  cases: number;
  newest: string;
  oldest: string;
  marques: string;
};

/** Lowercase, strip accents and Arabic diacritics, so "livré" matches "livre". */
export const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ًͯ-ْ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ');

export const INTENTS: Intent[] = [
  {
    id: 'price',
    ask: { en: 'How much is it?', fr: 'C’est combien ?', ar: 'بشحال؟' },
    match: {
      en: ['price', 'cost', 'how much', 'dh', 'expensive', 'cheap', 'discount', 'how much'],
      fr: ['prix', 'combien', 'cout', 'coute', 'cher', 'reduction', 'promo', 'combien ca coute'],
      ar: ['شحال', 'الثمن', 'ثمن', 'بشحال', 'غالي', 'تخفيض', 'درهم', 'bchhal', 'chhal', 'taman', 'tmn', 'ghali', 'floss', 'flous', 'prix', 'بشحال هو'],
    },
    answer: {
      en: (f) =>
        `Every case is ${f.price}. Same price for all ${f.cases} designs, and it does not change.\n\nYou pay the courier when it reaches you — nothing up front.`,
      fr: (f) =>
        `Chaque coque est à ${f.price}. Le même prix pour les ${f.cases} modèles, et il ne bouge pas.\n\nVous payez le livreur quand elle arrive — rien à l’avance.`,
      ar: (f) =>
        `كل جراب بـ ${f.price}. نفس الثمن لجميع ${f.cases} تصميم، وما كايتبدلش.\n\nكاتخلص لعامل التوصيل منين توصلك — ماكاين والو مقدّم.`,
    },
  },
  {
    id: 'fit',
    ask: { en: 'Will it fit my phone?', fr: 'Ça ira sur mon téléphone ?', ar: 'واش غادي يجي لتيليفوني؟' },
    match: {
      en: ['fit', 'iphone', 'model', 'samsung', 'size', 'my phone', 'compatible', 'which iphone', 'what iphone', 'does it fit', 'my iphone'],
      fr: ['taille', 'iphone', 'modele', 'samsung', 'compatible', 'mon telephone', 'ira', 'quel iphone', 'mon iphone', 'ca va'],
      ar: ['يجي', 'ايفون', 'آيفون', 'موديل', 'سامسونڭ', 'تيليفوني', 'هاتفي', 'مقاس', 'wach ghadi', 'ayfon', 'modil', 'telefoni', 'telifon', 'mqas', 'أشمن ايفون', 'ayfon dyali'],
    },
    answer: {
      en: (f) =>
        `Each case is made for one specific iPhone, so the camera surround, the buttons and the port line up exactly.\n\nWe cover ${f.models} models, from the ${f.oldest} to the ${f.newest}. Pick yours from the list on any case — if it is in the list, we can make it.\n\nWe do not do Samsung or other brands yet.`,
      fr: (f) =>
        `Chaque coque est faite pour un iPhone précis : le contour de l’appareil photo, les boutons et le port tombent exactement en face.\n\nNous couvrons ${f.models} modèles, du ${f.oldest} au ${f.newest}. Choisissez le vôtre dans la liste sur n’importe quelle coque — s’il y est, nous pouvons la faire.\n\nNous ne faisons pas encore Samsung ni d’autres marques.`,
      ar: (f) =>
        `كل جراب مصنوع لآيفون واحد بعينو، باش محيط الكاميرا والأزرار والمنفذ يجيو فبلاصتهم بالضبط.\n\nعندنا ${f.models} موديل، من ${f.oldest} حتى ${f.newest}. ختار ديالك من اللائحة ف أي جراب — إلا كان فاللائحة، كنقدرو نصنعوه.\n\nمازال ماكنديروش سامسونڭ ولا ماركات أخرى.`,
    },
  },
  {
    id: 'order',
    ask: { en: 'How do I order?', fr: 'Comment commander ?', ar: 'كيفاش نطلب؟' },
    match: {
      en: ['order', 'buy', 'purchase', 'how do i', 'want it', 'take it'],
      fr: ['commander', 'commande', 'acheter', 'achat', 'je veux', 'prendre'],
      ar: ['نطلب', 'الطلب', 'نشري', 'بغيت', 'كيفاش', 'شري', 'bghit', 'nchri', 'ntleb', 'kifach', 'kifash', 'commande'],
    },
    answer: {
      en: () =>
        `Open the case you want, pick your iPhone from the list, then press Order this case.\n\nYou fill in your name, phone, city and address — that is the whole thing. We come back to you on WhatsApp to confirm before anything is made.`,
      fr: () =>
        `Ouvrez la coque qui vous plaît, choisissez votre iPhone dans la liste, puis appuyez sur Commander cette coque.\n\nVous remplissez nom, téléphone, ville et adresse — c’est tout. Nous revenons vers vous sur WhatsApp pour confirmer avant toute fabrication.`,
      ar: () =>
        `حل الجراب اللي بغيتي، ختار الآيفون ديالك من اللائحة، ومن بعد ضغط على «اطلب هذا الجراب».\n\nكتعمّر الاسم، الهاتف، المدينة والعنوان — وصافي. كنرجعو ليك فالواتساب باش نأكدو قبل ما نصنعو شي حاجة.`,
    },
  },
  {
    id: 'delivery',
    ask: { en: 'Do you deliver to my city?', fr: 'Vous livrez chez moi ?', ar: 'واش كتوصلو لمدينتي؟' },
    match: {
      en: ['deliver', 'delivery', 'shipping', 'ship', 'city', 'where', 'long', 'days', 'how long', 'when will', 'arrive'],
      fr: ['livraison', 'livrez', 'livrer', 'ville', 'delai', 'jours', 'expedition', 'quand', 'combien de temps', 'arrive'],
      ar: ['توصيل', 'كتوصلو', 'توصلو', 'مدينة', 'مدينتي', 'شحال كتاخد', 'وقت', 'twsil', 'tawsil', 'katwuslo', 'kayweslo', 'madina', 'mdina', 'إمتى', 'fouqach', 'chhal katakhod'],
    },
    answer: {
      en: (f) =>
        `We ship anywhere in ${f.country.en}. Tell us your city and we confirm.\n\nWe set the delivery time with you when we confirm the order, rather than promising a number we cannot keep for every city.`,
      fr: (f) =>
        `Nous livrons partout au ${f.country.fr}. Dites-nous votre ville et nous confirmons.\n\nLe délai est fixé avec vous au moment de la confirmation, plutôt que de promettre un chiffre que nous ne pourrions pas tenir pour toutes les villes.`,
      ar: (f) =>
        `كنوصلو لكل أنحاء ${f.country.ar}. قول لنا المدينة ديالك ونأكدو ليك.\n\nكنحددو وقت التوصيل معاك منين كنأكدو الطلب، عوض ما نوعدو برقم ماغاديش نقدرو نحافظو عليه فكل مدينة.`,
    },
  },
  {
    id: 'payment',
    ask: { en: 'How do I pay?', fr: 'Comment payer ?', ar: 'كيفاش نخلص؟' },
    match: {
      en: ['pay', 'payment', 'cash', 'card', 'money', 'cod'],
      fr: ['payer', 'paiement', 'especes', 'carte', 'argent', 'livraison paiement'],
      ar: ['نخلص', 'الخلاص', 'خلاص', 'كاش', 'بطاقة', 'فلوس', 'nkhlas', 'khlas', 'lkhlas', 'cash', 'kart'],
    },
    answer: {
      en: (f) =>
        `Cash on delivery. You pay the courier when the case reaches you — nothing up front and no card needed.\n\n${f.price} per case.`,
      fr: (f) =>
        `Paiement à la livraison. Vous payez le livreur quand la coque arrive — rien à l’avance, aucune carte nécessaire.\n\n${f.price} la coque.`,
      ar: (f) =>
        `الخلاص عند الاستلام. كاتخلص لعامل التوصيل منين يوصلك الجراب — ماكاين والو مقدّم وماخاصكش بطاقة.\n\n${f.price} للجراب.`,
    },
  },
  {
    id: 'photos',
    ask: { en: 'Are the photos real?', fr: 'Les photos sont réelles ?', ar: 'واش التصاور حقيقية؟' },
    match: {
      en: ['photo', 'picture', 'real', 'mockup', 'render', 'image', 'look like'],
      fr: ['photo', 'reelle', 'reel', 'vraie', 'montage', 'rendu', 'image'],
      ar: ['تصاور', 'صورة', 'صور', 'حقيقية', 'موكاب', 'تصميم', 'tsawer', 'swar', 'hqiqia', 'haqiqia', 'mockup'],
    },
    answer: {
      en: () =>
        `Yes. Every case is photographed as it ships.\n\nOpen any case and the "Real photo" tab shows the original, unedited shot — the artwork is never retouched. That tab exists so you can check rather than take our word for it.`,
      fr: () =>
        `Oui. Chaque coque est photographiée telle qu’elle est expédiée.\n\nOuvrez une coque et l’onglet « Vraie photo » montre le cliché d’origine, non retouché. Cet onglet existe pour que vous puissiez vérifier plutôt que nous croire sur parole.`,
      ar: () =>
        `آه. كل جراب متصور بحالو بحال ما كايتشحن.\n\nحل أي جراب وغادي تلقى تبويب «صورة حقيقية» كايوريك اللقطة الأصلية بلا أي تعديل. هاد التبويب كاين باش تقدر تشوف بعينيك عوض ما تثق فينا غير هكذا.`,
    },
  },
  {
    id: 'official',
    ask: { en: 'Are these official?', fr: 'C’est officiel ?', ar: 'واش رسمية؟' },
    match: {
      en: ['official', 'licensed', 'genuine', 'bmw', 'porsche', 'mercedes', 'authentic'],
      fr: ['officiel', 'officielle', 'licence', 'authentique', 'bmw', 'porsche', 'mercedes'],
      ar: ['رسمي', 'رسمية', 'أصلي', 'اصلي', 'ترخيص', 'asli', 'rasmi', 'original'],
    },
    answer: {
      en: () =>
        `No, and we would rather say so. These are independent cases printed with automotive artwork.\n\nThe marque names and logos in the designs belong to their manufacturers. We are not affiliated with any of them and not endorsed by them.`,
      fr: () =>
        `Non, et nous préférons le dire. Ce sont des coques indépendantes imprimées avec des illustrations automobiles.\n\nLes noms et logos des marques appartiennent à leurs constructeurs. Nous ne sommes affiliés à aucun d’eux ni approuvés par eux.`,
      ar: () =>
        `لا، وكنفضلو نقولوها. هادي أجربة مستقلة مطبوعة بتصاميم ديال الطوموبيلات.\n\nأسماء العلامات وشعاراتها ملك ديال الشركات ديالهم. حنا ماشي تابعين ليهم ولا معتمدين منهم.`,
    },
  },
  {
    id: 'returns',
    ask: { en: 'What if I do not like it?', fr: 'Et si ça ne me plaît pas ?', ar: 'إلا ما عجبنيش؟' },
    match: {
      en: ['return', 'refund', 'broken', 'wrong', 'problem', 'guarantee', 'warranty', 'not like', 'breaks', 'break', 'damaged', 'defect', 'exchange', 'change it', 'send back'],
      fr: ['retour', 'rembours', 'casse', 'probleme', 'garantie', 'plait pas', 'erreur', 'casse', 'abime', 'defaut', 'echange', 'renvoyer'],
      ar: ['إرجاع', 'ارجاع', 'مشكل', 'ضمان', 'ماعجبنيش', 'عجبنيش', 'خطأ', 'machkil', 'mouchkil', 'ma3jabnich', 'majabnich', 'garanti'],
    },
    answer: {
      en: () =>
        `You pay on delivery, so you see the case before any money changes hands.\n\nIf what arrives is damaged or is not what you ordered, message us and we sort it out.`,
      fr: () =>
        `Vous payez à la livraison, donc vous voyez la coque avant de payer quoi que ce soit.\n\nSi ce qui arrive est abîmé ou n’est pas ce que vous avez commandé, écrivez-nous et nous réglons ça.`,
      ar: () =>
        `كتخلص عند الاستلام، إذن كتشوف الجراب قبل ما تخرج ولا درهم.\n\nإلا وصلك خايب ولا ماشي هو اللي طلبتي، راسلنا وكنحلو المشكل.`,
    },
  },
  {
    id: 'catalogue',
    ask: { en: 'What cars do you have?', fr: 'Quelles voitures avez-vous ?', ar: 'شنو عندكم ديال الطوموبيلات؟' },
    match: {
      en: ['cars', 'models do you', 'have', 'catalogue', 'collection', 'designs', 'other', 'cases', 'case', 'available', 'stock', 'list', 'show me', 'what do you have', 'which ones', 'choices', 'options', 'designs', 'range', 'selection', 'what cars'],
      fr: ['voitures', 'avez vous', 'catalogue', 'collection', 'modeles', 'autres', 'designs', 'coques', 'coque', 'disponibles', 'disponible', 'stock', 'liste', 'montrez', 'quelles', 'lesquelles', 'choix', 'gamme', 'selection', 'quelles voitures'],
      ar: ['طوموبيلات', 'عندكم', 'المجموعة', 'تصاميم', 'أخرى', 'اخرى', '3andkom', 'andkom', 'tomobilat', 'tomobila', 'chno 3andkom', 'كاين', 'شنو كاين', 'اللائحة', 'المتوفر', 'متوفر', 'أجربة', 'جرابات', 'ljraba', 'kayn', 'chno kayn', 'lista', 'mtwfr'],
    },
    answer: {
      en: (f) =>
        `${f.cases} designs right now — BMW, Porsche, Mercedes-AMG, Nissan, McLaren and Bugatti.\n\nScroll up to the collection to see them all. If there is a car you want that we do not have, tell us — we add designs.`,
      fr: (f) =>
        `${f.cases} modèles pour l’instant — BMW, Porsche, Mercedes-AMG, Nissan, McLaren et Bugatti.\n\nRemontez à la collection pour les voir tous. S’il manque une voiture que vous voulez, dites-le — nous ajoutons des modèles.`,
      ar: (f) =>
        `${f.cases} تصميم دابا — BMW، Porsche، Mercedes-AMG، Nissan، McLaren و Bugatti.\n\nطلع للمجموعة باش تشوفهم كاملين. وإلا كانت شي طوموبيل بغيتيها وماعندناش، قول لنا — كنزيدو تصاميم.`,
    },
  },
];

/** The numbers the answers quote, read from the real settings. */
export function facts(caseCount: number, marques: string[] = []): Facts {
  const price = site.price === null ? '—' : `${site.price} ${site.currency}`;
  const newest = site.models[0] ?? '';
  const oldest = site.models[site.models.length - 1] ?? '';
  return {
    price,
    country: { en: site.delivery.country, fr: 'Maroc', ar: 'المغرب' },
    models: site.models.length,
    cases: caseCount,
    newest,
    oldest,
    marques: marques.join(', '),
  };
}

/**
 * The best intent for a line of text, or null when nothing is a clear match.
 *
 * Whole words, not substrings: "have" used to match "behave" and "car" matched
 * "card". `normalise` has already turned every separator into a space, so
 * padding both sides and searching for " word " is all a word boundary needs
 * here — and it works for a two-word key like "how much" too.
 *
 * An intent scores the sum of what it matched rather than its longest single
 * hit, so "what cases do you have" beats a one-word coincidence elsewhere.
 */
export function route(text: string, locale: Locale): Intent | null {
  const t = ` ${normalise(text).split(/\s+/).filter(Boolean).join(' ')} `;
  if (t.trim().length < 2) return null;

  let best: { intent: Intent; score: number } | null = null;

  for (const intent of INTENTS) {
    // Every language's keywords are tried, not just the page's: people write
    // Darija in a French-language session and type "prix" on the Arabic page.
    let score = 0;
    for (const raw of Object.values(intent.match).flat()) {
      const w = normalise(raw).split(/\s+/).filter(Boolean).join(' ');
      if (w && t.includes(` ${w} `)) score += w.length;
    }
    if (score && (!best || score > best.score)) best = { intent, score };
  }

  return best?.intent ?? null;
}
