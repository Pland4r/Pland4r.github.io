/* ---------------------------------------------------------------------------
   Looking up a language.

   A plain synchronous lookup, no context and no provider, because half the
   components that need words are server components and half are client ones —
   context only reaches the second kind. Passing the dictionary down as a prop
   works in both and is the same object either side of the hydration line.
   --------------------------------------------------------------------------- */

import { ar } from './ar';
import { en } from './en';
import { fr } from './fr';
import { DEFAULT_LOCALE, LOCALES, type Copy, type Locale } from './types';

export { DEFAULT_LOCALE, LOCALES };
export type { Copy, Locale };

const DICTIONARIES: Record<Locale, Copy> = { en, fr, ar };

export const getCopy = (locale: Locale): Copy => DICTIONARIES[locale];

/**
 * The path a page lives at. English is the site's root, so it takes no prefix —
 * `ma-cases.pages.dev/bugatti-chiron-pur-sport/` is what gets pasted into a
 * chat, and a language segment in there is just noise for most of the people
 * it is sent to.
 */
export function path(locale: Locale, rest = ''): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${prefix}/${rest}`.replace(/\/{2,}/g, '/');
}

/** Every locale's URL for the same page, for `hreflang` and the switcher. */
export const everyPath = (rest = ''): Record<Locale, string> =>
  Object.fromEntries(LOCALES.map((l) => [l, path(l, rest)])) as Record<Locale, string>;
