/* ---------------------------------------------------------------------------
   Hand-written copy, keyed by slug.

   Everything a photo can tell us — marque, model, shell colour, swatch and
   accent — is generated into `generated.json` by `scripts/assets.py`. What a
   photo cannot tell us is what the artwork *says*. That lives here.

   A case with no entry still works; its detail sheet simply shows less. Nothing
   is ever invented to fill the gap — `blurb` and `printed` describe what is
   actually printed on the case, so they are written by a person who has looked
   at it.

   To describe a new case, add its slug here. The slug is the filename lowercased
   with dashes: `Porsche - 911 Turbo S.jpeg` -> `porsche-911-turbo-s`.

   Descriptions are per language. A language left out falls back to English
   rather than disappearing, so a case is never silently blank in French or
   Arabic — it is visibly still in English, which is the state you want to be
   able to see.

   `caption` is not translated. It quotes what is printed on the case, and the
   case does not change language.
   --------------------------------------------------------------------------- */

import { DEFAULT_LOCALE, type Locale } from './i18n';

/** A line of copy in as many languages as have been written. */
export type Translated = Partial<Record<Locale, string>> & { en: string };
export type TranslatedList = Partial<Record<Locale, string[]>> & { en: string[] };

export const pick = <T,>(
  value: (Partial<Record<Locale, T>> & Record<'en', T>) | undefined,
  locale: Locale,
): T | undefined => (value ? value[locale] ?? value[DEFAULT_LOCALE] : undefined);

export type Override = {
  /** Replaces the variant as the line under the model. Quoted from the case. */
  caption?: string;
  blurb?: Translated;
  printed?: TranslatedList;
  /** Only if the generated reading is off. */
  shellLabel?: string;
  accent?: string;
};

export const overrides: Record<string, Override> = {
  'bmw-m4-csl': {
    caption: '“Mineral Grey Metallic”',
    blurb: {
      en: 'The CSL in profile and head-on, set in a clean editorial layout with a full technical write-up running down the right-hand column.',
      fr: 'La CSL de profil et de face, dans une mise en page éditoriale épurée, avec une fiche technique complète qui descend le long de la colonne de droite.',
      ar: 'سيارة CSL من الجانب ومن الأمام، في تصميم تحريري نظيف، مع بطاقة تقنية كاملة تمتد على طول العمود الأيمن.',
    },
    printed: {
      en: [
        'BMW · “Motorsport” · German Made',
        'Side profile + front three-quarter renders',
        '“Mineral Grey Metallic” set vertically',
        'German Engineering · “Motorsport”',
      ],
      fr: [
        'BMW · « Motorsport » · German Made',
        'Profil + trois-quarts avant',
        '« Mineral Grey Metallic » à la verticale',
        'German Engineering · « Motorsport »',
      ],
      ar: [
        'BMW · «Motorsport» · German Made',
        'منظر جانبي + ثلاثة أرباع أمامي',
        '«Mineral Grey Metallic» عمودياً',
        'German Engineering · «Motorsport»',
      ],
    },
  },

  'porsche-911-gt3-rs': {
    caption: '“Perfection is never the start”',
    blurb: {
      en: 'A blueprint treatment — front, rear and side elevations with real dimension callouts, wrapped around a Shark Blue GT3 RS.',
      fr: 'Un traitement façon plan technique — élévations avant, arrière et latérale avec cotes réelles, autour d’une GT3 RS Shark Blue.',
      ar: 'معالجة على هيئة مخطط هندسي — مساقط أمامية وخلفية وجانبية مع أبعاد حقيقية، حول سيارة GT3 RS بلون Shark Blue.',
    },
    printed: {
      en: [
        'PORSCHE · 911 GT3 RS',
        'Technical elevations with 1.852 / 2.457 / 4.573 mm callouts',
        'Oversized PORSCHE wordmark behind the car',
        '“The 911 GT3 RS – Perfection is never the start –”',
      ],
      fr: [
        'PORSCHE · 911 GT3 RS',
        'Élévations techniques cotées 1.852 / 2.457 / 4.573 mm',
        'Logotype PORSCHE surdimensionné derrière la voiture',
        '« The 911 GT3 RS – Perfection is never the start – »',
      ],
      ar: [
        'PORSCHE · 911 GT3 RS',
        'مساقط تقنية بأبعاد 1.852 / 2.457 / 4.573 مم',
        'كلمة PORSCHE بحجم كبير خلف السيارة',
        '«The 911 GT3 RS – Perfection is never the start –»',
      ],
    },
  },

  'bmw-m3-e30': {
    caption: '“The Boxy”',
    // The M stripe is red and blue in roughly equal measure, so the sampler
    // averages them to purple. The blue is the one that reads as BMW.
    accent: '#3c78dc',
    blurb: {
      en: 'Line-art E30 over black, with the M stripe running the full height of the case and a spec block calling out the 2.5-16v four-cylinder.',
      fr: 'E30 au trait sur fond noir, avec la bande M qui court sur toute la hauteur de la coque et un bloc technique mettant en avant le quatre-cylindres 2.5-16v.',
      ar: 'رسم خطي لسيارة E30 على خلفية سوداء، مع شريط M يمتد على كامل ارتفاع الجراب، وبطاقة مواصفات تبرز محرك 2.5-16v رباعي الأسطوانات.',
    },
    printed: {
      en: [
        'M Power stripe · BMW roundel',
        '///M3 · E30 · 2.5-16v i4 · 238 HP',
        '“The Boxy” — The Iconic',
        'Euro Dream · #CHASINGPERFECTION',
      ],
      fr: [
        'Bande M Power · logo BMW',
        '///M3 · E30 · 2.5-16v i4 · 238 ch',
        '« The Boxy » — The Iconic',
        'Euro Dream · #CHASINGPERFECTION',
      ],
      ar: [
        'شريط M Power · شعار BMW',
        '///M3 · E30 · 2.5-16v i4 · 238 حصاناً',
        '«The Boxy» — The Iconic',
        'Euro Dream · #CHASINGPERFECTION',
      ],
    },
  },

  'porsche-911-gt2-rs': {
    caption: '“Purple Candy”',
    blurb: {
      en: 'Candy purple over gloss black — the highest-contrast case in the collection, with a full spec column and a Rennsport road car below.',
      fr: 'Violet candy sur noir brillant — la coque la plus contrastée de la collection, avec une colonne technique complète et une Rennsport de route en dessous.',
      ar: 'بنفسجي لامع على أسود لمّاع — أعلى الأجربة تبايناً في المجموعة، مع عمود مواصفات كامل وسيارة Rennsport للطرق أسفله.',
    },
    printed: {
      en: [
        'GT2 RS · “German-Made” · Santorini',
        'PORSCHE 911 GT2 RS · “Purple Candy”',
        'Twin-turbo flat six · 700 HP · 553 lb-ft · 211 MPH',
        'Grand Tourismo · “Rennsport”',
      ],
      fr: [
        'GT2 RS · « German-Made » · Santorini',
        'PORSCHE 911 GT2 RS · « Purple Candy »',
        'Flat-six biturbo · 700 ch · 553 lb-ft · 211 MPH',
        'Grand Tourismo · « Rennsport »',
      ],
      ar: [
        'GT2 RS · «German-Made» · Santorini',
        'PORSCHE 911 GT2 RS · «Purple Candy»',
        'محرك سداسي مسطح مزدوج التوربو · 700 حصان · 553 lb-ft · 211 MPH',
        'Grand Tourismo · «Rennsport»',
      ],
    },
  },

  'bmw-m5': {
    caption: 'Year 2018',
    blurb: {
      en: 'Minimal and heavy — a chrome-gradient M5 wordmark filling the upper half, the car shot straight-on in black-on-black beneath it.',
      fr: 'Minimal et massif — un logotype M5 en dégradé chromé qui occupe la moitié haute, la voiture de face en noir sur noir en dessous.',
      ar: 'بسيط وثقيل — كلمة M5 بتدرّج كرومي تملأ النصف العلوي، والسيارة من الأمام بالأسود على الأسود تحتها.',
    },
    printed: {
      en: [
        'M5 in gradient chrome type',
        'Front three-quarter, black on black',
        'Engine 4,4L · Power 625 HP · Torque 750 NM · Weight 1930 KG',
        'BMW roundel, lower right',
      ],
      fr: [
        'M5 en typographie chromée dégradée',
        'Trois-quarts avant, noir sur noir',
        'Moteur 4,4L · Puissance 625 ch · Couple 750 NM · Poids 1930 KG',
        'Logo BMW, en bas à droite',
      ],
      ar: [
        'M5 بخط كرومي متدرّج',
        'ثلاثة أرباع أمامي، أسود على أسود',
        'المحرك 4,4L · القوة 625 حصاناً · العزم 750 NM · الوزن 1930 KG',
        'شعار BMW، أسفل اليمين',
      ],
    },
  },

  'mercedes-amg-cls-63': {
    caption: '“5.5-litre twin-turbo V8”',
    blurb: {
      en: 'Enormous CLS 63 type with the car cutting straight through it, plus a signature, top-down schematics and a two-column write-up.',
      fr: 'Un énorme CLS 63 typographique que la voiture traverse de part en part, avec une signature, des schémas vus de dessus et un texte sur deux colonnes.',
      ar: 'كتابة CLS 63 ضخمة تخترقها السيارة مباشرة، مع توقيع ومخططات من الأعلى ونص في عمودين.',
    },
    printed: {
      en: [
        'Mercedes-Benz star · MERCEDES AMG',
        'CLS 63 in oversized display type',
        'Side profile in gloss black',
        'Top-down schematics + signature detail',
      ],
      fr: [
        'Étoile Mercedes-Benz · MERCEDES AMG',
        'CLS 63 en très gros caractères',
        'Profil en noir brillant',
        'Schémas vus de dessus + détail de signature',
      ],
      ar: [
        'نجمة Mercedes-Benz · MERCEDES AMG',
        'CLS 63 بخط عرض ضخم',
        'منظر جانبي بالأسود اللمّاع',
        'مخططات من الأعلى + تفصيل التوقيع',
      ],
    },
  },

  'porsche-911-brabus': {
    caption: '“Brabus engineering”',
    blurb: {
      en: 'A Brabus-tuned 911 shot from the rear three-quarter, sitting under an oversized PORSCHE wordmark with BRABUS outlined behind the car.',
      fr: 'Une 911 préparée par Brabus vue de trois-quarts arrière, sous un logotype PORSCHE surdimensionné, avec BRABUS en contour derrière la voiture.',
      ar: 'سيارة 911 مُعدّلة من Brabus من زاوية ثلاثة أرباع خلفية، تحت كلمة PORSCHE بحجم كبير، مع BRABUS مُفرّغة خلف السيارة.',
    },
    printed: {
      en: [
        '911 · magenta script tag',
        'PORSCHE solid, BRABUS outlined behind the car',
        'Rear three-quarter 911 in matching pink',
        'PORSCHE BRABUS 911 write-up, inset photo and barcode',
      ],
      fr: [
        '911 · signature manuscrite magenta',
        'PORSCHE plein, BRABUS en contour derrière la voiture',
        '911 de trois-quarts arrière dans le même rose',
        'Texte PORSCHE BRABUS 911, photo en médaillon et code-barres',
      ],
      ar: [
        '911 · توقيع بخط مائل أرجواني',
        'PORSCHE مصمتة، وBRABUS مُفرّغة خلف السيارة',
        '911 من ثلاثة أرباع خلفية بالوردي نفسه',
        'نص PORSCHE BRABUS 911، وصورة مدرجة ورمز شريطي',
      ],
    },
  },

  'mclaren-senna': {
    caption: '“Named after Ayrton Senna”',
    blurb: {
      en: 'The Senna in white and pink across the full width of the case, with a magenta graffiti tag above and the model write-up along the foot.',
      fr: 'La Senna en blanc et rose sur toute la largeur de la coque, avec un tag graffiti magenta au-dessus et le texte du modèle le long du pied.',
      ar: 'سيارة Senna بالأبيض والوردي على كامل عرض الجراب، مع توقيع غرافيتي أرجواني في الأعلى ونص الطراز على طول الأسفل.',
    },
    printed: {
      en: [
        'Magenta graffiti tag · SENNA',
        'MCLAREN in oversized display type',
        'Full-profile Senna with pink wheels and aero',
        'MCLAREN SENNA write-up, inset panel and barcode',
      ],
      fr: [
        'Tag graffiti magenta · SENNA',
        'MCLAREN en très gros caractères',
        'Senna de profil intégral, jantes et aéro roses',
        'Texte MCLAREN SENNA, encart et code-barres',
      ],
      ar: [
        'توقيع غرافيتي أرجواني · SENNA',
        'MCLAREN بخط عرض ضخم',
        'Senna بالمنظر الجانبي الكامل بعجلات وأجنحة وردية',
        'نص MCLAREN SENNA، ولوحة مدرجة ورمز شريطي',
      ],
    },
  },

  'porsche-911-gt3-rs-blush': {
    caption: '“525 HP · 296 km/h · 3.2 s”',
    shellLabel: 'Blush',
    blurb: {
      en: 'Three cropped motorsport panels above a full pink GT3 RS, with the Porsche Motorsport crest and the factory write-up underneath.',
      fr: 'Trois panneaux motorsport recadrés au-dessus d’une GT3 RS entièrement rose, avec l’écusson Porsche Motorsport et le texte d’usine en dessous.',
      ar: 'ثلاث لوحات سباق مقصوصة فوق سيارة GT3 RS وردية بالكامل، مع شعار Porsche Motorsport ونص المصنع أسفلها.',
    },
    printed: {
      en: [
        'PORSCHE MOTORSPORT wordmark and crest',
        'GT3RS · three cropped panels of the car',
        'Write-up: 386 kW (525 hp), 860 kg downforce at 285 km/h',
        '525 HP · 296 KM/H · 3.2 S along the foot',
      ],
      fr: [
        'Logotype et écusson PORSCHE MOTORSPORT',
        'GT3RS · trois panneaux recadrés de la voiture',
        'Texte : 386 kW (525 ch), 860 kg d’appui à 285 km/h',
        '525 HP · 296 KM/H · 3.2 S le long du pied',
      ],
      ar: [
        'كلمة وشعار PORSCHE MOTORSPORT',
        'GT3RS · ثلاث لوحات مقصوصة للسيارة',
        'النص: 386 kW (525 حصاناً)، 860 كجم قوة ضغط عند 285 كم/س',
        '525 HP · 296 KM/H · 3.2 S على طول الأسفل',
      ],
    },
  },

  'nissan-skyline-gt-r-r34': {
    caption: '“Bullet”',
    blurb: {
      en: 'The R34 in Bayside Blue livery over black, shown in profile and from the rear three-quarter, with a spec column and a long write-up on the car’s screen history.',
      fr: 'La R34 en livrée Bayside Blue sur fond noir, de profil et de trois-quarts arrière, avec une colonne technique et un long texte sur sa carrière à l’écran.',
      ar: 'سيارة R34 بطلاء Bayside Blue على خلفية سوداء، من الجانب ومن ثلاثة أرباع خلفية، مع عمود مواصفات ونص طويل عن تاريخها السينمائي.',
    },
    printed: {
      en: [
        '“GT-R R34” · NISSAN SKYLINE · BULLET',
        'BULLET · “GT-R R34”',
        'Top speed 155 MPH (248 KM/H) · 2.6 inline six · 280 HP · 558-HP twin turbo',
        'NISSAN SKYLINE · “Brian O’Conner”',
      ],
      fr: [
        '« GT-R R34 » · NISSAN SKYLINE · BULLET',
        'BULLET · « GT-R R34 »',
        'Vitesse max 155 MPH (248 KM/H) · six en ligne 2.6 · 280 ch · biturbo 558 ch',
        'NISSAN SKYLINE · « Brian O’Conner »',
      ],
      ar: [
        '«GT-R R34» · NISSAN SKYLINE · BULLET',
        'BULLET · «GT-R R34»',
        'السرعة القصوى 155 MPH (248 كم/س) · ستة أسطوانات على التوالي 2.6 · 280 حصاناً · مزدوج التوربو 558 حصاناً',
        'NISSAN SKYLINE · «Brian O’Conner»',
      ],
    },
  },

  'bmw-m3-touring': {
    caption: '“…and that is close enough”',
    blurb: {
      en: 'A quote case — four lines of heavy display type over black, with the Riviera Blue M3 Touring sitting underneath and the engine write-up below.',
      fr: 'Une coque à citation — quatre lignes de gros caractères sur fond noir, la M3 Touring Riviera Blue en dessous et le texte moteur plus bas.',
      ar: 'جراب باقتباس — أربعة أسطر بخط عرض ثقيل على خلفية سوداء، وأسفلها M3 Touring بلون Riviera Blue، ثم نص المحرك.',
    },
    printed: {
      en: [
        'BMW M3, set vertically',
        '“Money can’t buy happiness but it can buy a BMW M3”',
        'Blue M3 Touring, front three-quarter',
        'M TwinPower Turbo inline 6 · 510 hp (375 kW) · 62 mph in under 3.6 s',
      ],
      fr: [
        'BMW M3, à la verticale',
        '« Money can’t buy happiness but it can buy a BMW M3 »',
        'M3 Touring bleue, trois-quarts avant',
        'M TwinPower Turbo six en ligne · 510 ch (375 kW) · 100 km/h en moins de 3,6 s',
      ],
      ar: [
        'BMW M3، عمودياً',
        '«Money can’t buy happiness but it can buy a BMW M3»',
        'M3 Touring زرقاء، ثلاثة أرباع أمامي',
        'M TwinPower Turbo ستة على التوالي · 510 أحصنة (375 kW) · 100 كم/س في أقل من 3.6 ثانية',
      ],
    },
  },

  'porsche-911-gt3-rs-roar': {
    caption: '“Less Talk, More Roar.”',
    blurb: {
      en: 'An advert-style layout — the headline in heavy serif over black, the GT3 RS in profile beneath it, and two columns of copy along the foot.',
      fr: 'Une mise en page façon publicité — le titre en gras avec empattement sur fond noir, la GT3 RS de profil en dessous, et deux colonnes de texte le long du pied.',
      ar: 'تصميم على هيئة إعلان — العنوان بخط مذنّب ثقيل على خلفية سوداء، وتحته GT3 RS من الجانب، وعمودان من النص على طول الأسفل.',
    },
    printed: {
      en: [
        'PORSCHE · 911 GT3 RS, set vertically',
        '“Less Talk, More Roar.”',
        'Side profile, chalk grey with red wheels',
        'The 911 GT3RS · 465 Nm · 386 kW (525 PS) · 0–62 mph in 3.2 s · 184 mph',
      ],
      fr: [
        'PORSCHE · 911 GT3 RS, à la verticale',
        '« Less Talk, More Roar. »',
        'Profil, gris craie et jantes rouges',
        'The 911 GT3RS · 465 Nm · 386 kW (525 ch) · 0–100 km/h en 3,2 s · 296 km/h',
      ],
      ar: [
        'PORSCHE · 911 GT3 RS، عمودياً',
        '«Less Talk, More Roar.»',
        'منظر جانبي، رمادي طباشيري بعجلات حمراء',
        'The 911 GT3RS · 465 Nm · 386 kW (525 PS) · 0–100 كم/س في 3.2 ثانية · 296 كم/س',
      ],
    },
  },

  'bugatti-chiron-pur-sport': {
    caption: '“Chiron Pur Sport”',
    blurb: {
      en: 'BUGATTI in enormous gradient type running off both edges, with the green Chiron Pur Sport cutting across it and a spec strip along the foot.',
      fr: 'BUGATTI en énormes caractères dégradés qui débordent des deux côtés, la Chiron Pur Sport verte qui les traverse et un bandeau technique le long du pied.',
      ar: 'كلمة BUGATTI بخط متدرّج ضخم يتجاوز الحافتين، تخترقها Chiron Pur Sport الخضراء، وشريط مواصفات على طول الأسفل.',
    },
    printed: {
      en: [
        'BUGATTI in oversized gradient type',
        'Chiron Pur Sport in green and black',
        'CHIRON PUR SPORT · French tricolore',
        '1500 HP · 8.0 L W16 · 420 km/h · 0–100 in 2.3 s · 1600 Nm · 1985 KG',
      ],
      fr: [
        'BUGATTI en très gros caractères dégradés',
        'Chiron Pur Sport en vert et noir',
        'CHIRON PUR SPORT · drapeau tricolore',
        '1500 ch · 8.0 L W16 · 420 km/h · 0–100 en 2,3 s · 1600 Nm · 1985 KG',
      ],
      ar: [
        'BUGATTI بخط متدرّج ضخم',
        'Chiron Pur Sport بالأخضر والأسود',
        'CHIRON PUR SPORT · العلم الفرنسي',
        '1500 حصان · 8.0 L W16 · 420 كم/س · 0–100 في 2.3 ثانية · 1600 Nm · 1985 KG',
      ],
    },
  },

  'porsche-911-gt3-rs-pink': {
    caption: '“Pink”',
    blurb: {
      en: 'Pink over gloss black — the GT3 RS in profile above a full spec column, with a Rennsport car below.',
      fr: 'Rose sur noir brillant — la GT3 RS de profil au-dessus d’une colonne technique complète, avec une Rennsport en dessous.',
      ar: 'وردي على أسود لمّاع — GT3 RS من الجانب فوق عمود مواصفات كامل، مع سيارة Rennsport أسفله.',
    },
    printed: {
      en: [
        'RENNSPORT · “German Made”',
        'PORSCHE 911 GT3 RS · “Pink”',
        'Max power 518 HP at 8,500 RPM · 3,996 cc · 81.5 mm stroke',
        'Grand Tourismo · “Rennsport”',
      ],
      fr: [
        'RENNSPORT · « German Made »',
        'PORSCHE 911 GT3 RS · « Pink »',
        'Puissance max 518 ch à 8 500 tr/min · 3 996 cm³ · course 81,5 mm',
        'Grand Tourismo · « Rennsport »',
      ],
      ar: [
        'RENNSPORT · «German Made»',
        'PORSCHE 911 GT3 RS · «Pink»',
        'أقصى قوة 518 حصاناً عند 8500 دورة/د · 3996 سم³ · شوط 81.5 مم',
        'Grand Tourismo · «Rennsport»',
      ],
    },
  },
};
