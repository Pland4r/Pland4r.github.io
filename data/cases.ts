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
import { overrides } from './overrides';

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

export const cases: Case[] = (generated as Omit<Case, 'caption'>[]).map((g) => {
  const o = overrides[g.slug] ?? {};
  return {
    ...g,
    shellLabel: o.shellLabel ?? g.shellLabel,
    accent: o.accent ?? g.accent,
    caption: o.caption ?? g.variant,
    blurb: o.blurb,
    printed: o.printed,
  };
});

export const getCase = (slug: string) => cases.find((c) => c.slug === slug);
