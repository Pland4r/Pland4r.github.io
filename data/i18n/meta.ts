import type { Metadata } from 'next';
import { getCase } from '@/data/cases';
import { site } from '@/data/site';
import { rev } from '@/data/rev';
import { everyPath, getCopy, path, type Locale } from './index';

/**
 * `hreflang` for every page, in every language.
 *
 * Three translations of one page are three URLs saying the same thing, which
 * is what a search engine would otherwise treat as duplicated. These links say
 * they are the same page in different languages, and `x-default` names the one
 * to show someone whose language is none of them.
 */
const languages = (rest = '') => {
  const all = everyPath(rest);
  return { ...all, 'x-default': all.en };
};

export function homeMetadata(locale: Locale): Metadata {
  const copy = getCopy(locale);
  const title = `${site.name} — ${copy.meta.tagline}`;
  const here = path(locale);

  return {
    title,
    description: copy.meta.description,
    alternates: { canonical: here, languages: languages() },
    openGraph: {
      title,
      description: copy.meta.description,
      siteName: site.name,
      locale,
      type: 'website',
      url: here,
    },
  };
}

export function caseMetadata(locale: Locale, slug: string): Metadata {
  const copy = getCopy(locale);
  const item = getCase(slug, locale);
  if (!item) return {};
  const title = copy.meta.caseTitle(item.marque, item.model, site.name);
  const description =
    item.blurb ?? copy.meta.caseDescription(item.marque, item.model, item.shellLabel);
  const here = path(locale, `${slug}/`);
  // Absolute, because the scrapers that read this are not on our host.
  const image = `${site.url}/og/${slug}.jpg${rev(slug)}`;

  return {
    title,
    description,
    alternates: { canonical: here, languages: languages(`${slug}/`) },
    openGraph: {
      title,
      description,
      siteName: site.name,
      locale,
      type: 'website',
      url: here,
      images: [
        { url: image, width: 1200, height: 630, alt: `${item.marque} ${item.model}` },
      ],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
