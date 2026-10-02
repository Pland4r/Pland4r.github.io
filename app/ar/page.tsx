import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { homeMetadata } from '@/data/i18n/meta';

export const metadata: Metadata = homeMetadata('ar');

export default function Page() {
  return <HomePage locale="ar" />;
}
