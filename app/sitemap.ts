import type { MetadataRoute } from 'next';
import { cases } from '@/data/cases';
import { LOCALES, everyPath, path } from '@/data/i18n';
import { site } from '@/data/site';

// Emitted as a file at build time, since the site is a static export.
export const dynamic = 'force-static';

/**
 * Every page, in every language.
 *
 * Each entry carries the other languages' URLs as `alternates`, which is what
 * tells a search engine these are translations of one page rather than three
 * pages competing with each other. Written from `cases`, so a photo dropped
 * into /pic reaches the sitemap on the next build without anyone adding it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (rest: string) =>
    Object.fromEntries(
      Object.entries(everyPath(rest)).map(([l, p]) => [l, `${site.url}${p}`]),
    );

  const pages = ['', ...cases.map((c) => `${c.slug}/`)];

  return pages.flatMap((rest) =>
    LOCALES.map((locale) => ({
      url: `${site.url}${path(locale, rest)}`,
      changeFrequency: (rest === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: rest === '' ? 1 : 0.8,
      alternates: { languages: absolute(rest) },
    })),
  );
}
