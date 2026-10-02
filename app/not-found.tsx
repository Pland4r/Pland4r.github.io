import type { Metadata } from 'next';
import NotFound from '@/components/NotFound';

export const metadata: Metadata = {
  title: '404 — MA Cases',
  // A dead link should not be indexed as a page of the shop.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <NotFound />;
}
