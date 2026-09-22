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
   --------------------------------------------------------------------------- */

export type Override = {
  /** Replaces the variant as the line under the model. */
  caption?: string;
  blurb?: string;
  printed?: string[];
  /** Only if the generated reading is off. */
  shellLabel?: string;
  accent?: string;
};

export const overrides: Record<string, Override> = {
  'bmw-m4-csl': {
    caption: '“Mineral Grey Metallic”',
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

  'porsche-911-gt3-rs': {
    caption: '“Perfection is never the start”',
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

  'bmw-m3-e30': {
    caption: '“The Boxy”',
    // The M stripe is red and blue in roughly equal measure, so the sampler
    // averages them to purple. The blue is the one that reads as BMW.
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

  'porsche-911-gt2-rs': {
    caption: '“Purple Candy”',
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

  'bmw-m5': {
    caption: 'Year 2018',
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

  'mercedes-amg-cls-63': {
    caption: '“5.5-litre twin-turbo V8”',
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

  'porsche-911-brabus': {
    caption: '“Brabus engineering”',
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

  'mclaren-senna': {
    caption: '“Named after Ayrton Senna”',
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

  'porsche-911-gt3-rs-blush': {
    caption: '“525 HP · 296 km/h · 3.2 s”',
    shellLabel: 'Blush',
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

  'porsche-911-gt3-rs-pink': {
    caption: '“Pink”',
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
};
