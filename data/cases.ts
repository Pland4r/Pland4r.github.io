/* ---------------------------------------------------------------------------
   The collection.

   Nothing here is maintained by hand. Every case comes from a photo in /pic
   named `Marque - Model[ - Variant].jpeg`; `scripts/assets.py` discovers it,
   cuts it out, reads the shell and accent colours off the artwork, and writes
   `generated.json`. This merges that with the hand-written descriptions in
   `overrides.ts`.

   Adding a case is therefore: drop the photo in, run the pipeline. Describing
   it is optional and separate.
   --------------------------------------------------------------------------- */

import generated from './generated.json';
import { DEFAULT_LOCALE, type Locale } from './i18n';
import { overrides, pick } from './overrides';

export type Case = {
  slug: string;
  marque: string;
  model: string;
  /** Third part of the filename, used to tell two cases of one model apart. */
  variant: string;
  /** The line under the model — an override, else the variant, else nothing. */
  caption: string;
  /** Read off the artwork, e.g. "Gloss Black", "Dusty Pink". */
  shellLabel: string;
  /** The shell colour itself, for the dot on the card badge. */
  swatch: string;
  /** Strongest colour in the artwork, used for glows. */
  accent: string;
  /** Written by a person who looked at the case. Absent until then. */
  blurb?: string;
  printed?: string[];
};

type Generated = Omit<Case, 'caption' | 'blurb' | 'printed'> & { named: boolean };

/**
 * The collection in one language.
 *
 * A description with no translation yet falls back to English rather than
 * disappearing, so a case is never silently blank in French or Arabic — it is
 * visibly still in English, which is the state you want to be able to see.
 */
export function collection(locale: Locale = DEFAULT_LOCALE): Case[] {
  return (generated as Generated[])
    // A photo with no name yet is fully rendered but held back: showing it
    // under a guessed model is worse than not showing it at all.
    .filter((g) => g.named)
    .map((g) => {
      const o = overrides[g.slug] ?? {};
      return {
        ...g,
        shellLabel: o.shellLabel ?? g.shellLabel,
        accent: o.accent ?? g.accent,
        caption: o.caption ?? g.variant,
        blurb: pick(o.blurb, locale),
        printed: pick(o.printed, locale),
      };
    });
}

/**
 * The English collection.
 *
 * Kept for everything that only needs the parts a photo gives — the slugs for
 * `generateStaticParams`, the marque list, the count — none of which change
 * with language.
 */
export const cases: Case[] = collection();

export const getCase = (slug: string, locale: Locale = DEFAULT_LOCALE) =>
  collection(locale).find((c) => c.slug === slug);
