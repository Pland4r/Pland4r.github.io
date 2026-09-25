/* ---------------------------------------------------------------------------
   Cache stamps.

   Every generated file keeps its name for life — re-rendering a case writes
   over `bugatti-chiron-pur-sport-md.webp`, it does not write a new file. The
   images go out with a week of cache on them, so without a stamp a visitor who
   has seen the site before keeps the old picture for a week after it is fixed,
   and nothing about the deploy looks wrong from the outside.

   `scripts/assets.py` hashes the files a browser actually fetches for each case
   and writes `rev.json`. Hanging that off the URL means a re-rendered case is a
   different URL, so it is fetched again — and an unchanged one keeps its stamp
   and stays cached.
   --------------------------------------------------------------------------- */

import revs from './rev.json';

/** `?v=<hash>` for a case's assets, or '' if the case has no stamp yet. */
export const rev = (slug: string): string => {
  const hash = (revs as Record<string, string>)[slug];
  return hash ? `?v=${hash}` : '';
};
