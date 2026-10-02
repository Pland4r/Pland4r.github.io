import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CasePage from '@/components/CasePage';
import { cases, getCase } from '@/data/cases';
import { caseMetadata } from '@/data/i18n/meta';

type Props = { params: Promise<{ slug: string }> };

/**
 * One page per case, written out at build time.
 *
 * The collection is a single page and a case opens in a sheet over it, which is
 * a good way to browse and a useless thing to send someone: the address bar
 * never changes, so "here is the Chiron" can only ever be a link to the whole
 * site. These pages are the shareable half — a real URL per case, with its own
 * link preview, in each language.
 *
 * A static export ships exactly these pages and nothing else.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return caseMetadata('ar', slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const item = getCase(slug, 'ar');
  if (!item) notFound();

  return <CasePage item={item} locale="ar" />;
}
