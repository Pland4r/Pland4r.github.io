/* ---------------------------------------------------------------------------
   The collection.

   Every `blurb` and `printed` line below describes what is actually printed on
   the physical case in the photo — nothing is invented. If you add a new case,
   drop its photo in /pic, run `npm run assets`, and add an entry here.
   --------------------------------------------------------------------------- */

export type Case = {
  slug: string;
  marque: string;
  model: string;
  /** The quoted line the artwork itself uses. */
  caption: string;
  /** The shell the artwork is printed on — drives the swatch on each card. */
  shell: 'white' | 'black' | 'pink';
  shellLabel: string;
  /** Accent colour pulled from the artwork, used for glow + hover states. */
  accent: string;
  blurb: string;
  /** Text and detail visible on the printed artwork. */
  printed: string[];
};

export const cases: Case[] = [
  {
    slug: 'bmw-m4-csl',
    marque: 'BMW',
    model: 'M4 CSL',
    caption: '“Mineral Grey Metallic”',
    shell: 'white',
    shellLabel: 'Gloss White',
    accent: '#96aac8',
    blurb:
      'The CSL in profile and head-on, set in a clean editorial layout with a full ' +
      'technical write-up running down the right-hand column.',
    printed: [
      'BMW · “Motorsport” · German Made',
      'Side profile + front three-quarter renders',
      '“Mineral Grey Metallic” set vertically',
      'German Engineering · “Motorsport”',
    ],
  },
  {
    slug: 'porsche-911-gt3-rs',
    marque: 'Porsche',
    model: '911 GT3 RS',
    caption: '“Perfection is never the start”',
    shell: 'white',
    shellLabel: 'Gloss White',
    accent: '#5aa0eb',
    blurb:
      'A blueprint treatment — front, rear and side elevations with real dimension ' +
      'callouts, wrapped around a Shark Blue GT3 RS.',
    printed: [
      'PORSCHE · 911 GT3 RS',
      'Technical elevations with 1.852 / 2.457 / 4.573 mm callouts',
      'Oversized PORSCHE wordmark behind the car',
      '“The 911 GT3 RS – Perfection is never the start –”',
    ],
  },
  {
    slug: 'bmw-m3-e30',
    marque: 'BMW',
    model: 'M3 E30',
    caption: '“The Boxy”',
    shell: 'black',
    shellLabel: 'Gloss Black',
    accent: '#3c78dc',
    blurb:
      'Line-art E30 over black, with the M stripe running the full height of the ' +
      'case and a spec block calling out the 2.5-16v four-cylinder.',
    printed: [
      'M Power stripe · BMW roundel',
      '///M3 · E30 · 2.5-16v i4 · 238 HP',
      '“The Boxy” — The Iconic',
      'Euro Dream · #CHASINGPERFECTION',
    ],
  },
  {
    slug: 'porsche-911-gt2-rs',
    marque: 'Porsche',
    model: '911 GT2 RS',
    caption: '“Purple Candy”',
    shell: 'black',
    shellLabel: 'Gloss Black',
    accent: '#9b5ce6',
    blurb:
      'Candy purple over gloss black — the highest-contrast case in the collection, ' +
      'with a full spec column and a Rennsport road car below.',
    printed: [
      'GT2 RS · “German-Made” · Santorini',
      'PORSCHE 911 GT2 RS · “Purple Candy”',
      'Twin-turbo flat six · 700 HP · 553 lb-ft · 211 MPH',
      'Grand Tourismo · “Rennsport”',
    ],
  },
  {
    slug: 'bmw-m5-f90',
    marque: 'BMW',
    model: 'M5',
    caption: 'Year 2018',
    shell: 'black',
    shellLabel: 'Gloss Black',
    accent: '#aab0bc',
    blurb:
      'Minimal and heavy — a chrome-gradient M5 wordmark filling the upper half, ' +
      'the car shot straight-on in black-on-black beneath it.',
    printed: [
      'M5 in gradient chrome type',
      'Front three-quarter, black on black',
      'Engine 4,4L · Power 625 HP · Torque 750 NM · Weight 1930 KG',
      'BMW roundel, lower right',
    ],
  },
  {
    slug: 'mercedes-amg-cls63',
    marque: 'Mercedes-AMG',
    model: 'CLS 63',
    caption: '“5.5-litre twin-turbo V8”',
    shell: 'white',
    shellLabel: 'Gloss White',
    accent: '#8ca0bc',
    blurb:
      'Enormous CLS 63 type with the car cutting straight through it, plus a ' +
      'signature, top-down schematics and a two-column write-up.',
    printed: [
      'Mercedes-Benz star · MERCEDES AMG',
      'CLS 63 in oversized display type',
      'Side profile in gloss black',
      'Top-down schematics + signature detail',
    ],
  },
  {
    slug: 'porsche-911-brabus',
    marque: 'Porsche',
    model: '911 Brabus',
    caption: '“Brabus engineering”',
    shell: 'pink',
    shellLabel: 'Dusty Pink',
    accent: '#c9829a',
    blurb:
      'A Brabus-tuned 911 shot from the rear three-quarter, sitting under an ' +
      'oversized PORSCHE wordmark with BRABUS outlined behind the car.',
    printed: [
      '911 · magenta script tag',
      'PORSCHE solid, BRABUS outlined behind the car',
      'Rear three-quarter 911 in matching pink',
      'PORSCHE BRABUS 911 write-up, inset photo and barcode',
    ],
  },
  {
    slug: 'mclaren-senna',
    marque: 'McLaren',
    model: 'Senna',
    caption: '“Named after Ayrton Senna”',
    shell: 'pink',
    shellLabel: 'Dusty Pink',
    accent: '#d896a8',
    blurb:
      'The Senna in white and pink across the full width of the case, with a ' +
      'magenta graffiti tag above and the model write-up along the foot.',
    printed: [
      'Magenta graffiti tag · SENNA',
      'MCLAREN in oversized display type',
      'Full-profile Senna with pink wheels and aero',
      'MCLAREN SENNA write-up, inset panel and barcode',
    ],
  },
  {
    slug: 'porsche-911-gt3-rs-blush',
    marque: 'Porsche',
    model: '911 GT3 RS',
    caption: '“525 HP · 296 km/h · 3.2 s”',
    shell: 'pink',
    shellLabel: 'Blush',
    accent: '#b98a92',
    blurb:
      'Three cropped motorsport panels above a full pink GT3 RS, with the ' +
      'Porsche Motorsport crest and the factory write-up underneath.',
    printed: [
      'PORSCHE MOTORSPORT wordmark and crest',
      'GT3RS · three cropped panels of the car',
      'Write-up: 386 kW (525 hp), 860 kg downforce at 285 km/h',
      '525 HP · 296 KM/H · 3.2 S along the foot',
    ],
  },
  {
    slug: 'porsche-911-gt3-rs-pink',
    marque: 'Porsche',
    model: '911 GT3 RS',
    caption: '“Pink”',
    shell: 'black',
    shellLabel: 'Gloss Black',
    accent: '#ff7ab8',
    blurb:
      'Pink over gloss black — the GT3 RS in profile above a full spec column, ' +
      'with a Rennsport car below.',
    printed: [
      'RENNSPORT · “German Made”',
      'PORSCHE 911 GT3 RS · “Pink”',
      'Max power 518 HP at 8,500 RPM · 3,996 cc · 81.5 mm stroke',
      'Grand Tourismo · “Rennsport”',
    ],
  },
];

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
