import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { site } from '@/data/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Runs before paint. Until this marks the document, `.reveal` blocks stay fully
 * visible, so the page is never blank if scripting is off or a bundle fails.
 *
 * It sets a `data-js` attribute rather than a class: React owns `className` on
 * <html> and would report the extra class as a hydration mismatch, whereas an
 * attribute it never renders is left alone. `suppressHydrationWarning` covers
 * the element against any other pre-hydration tampering, e.g. an extension.
 */
const BOOT = `try{
var d=document.documentElement;
if('IntersectionObserver' in window){d.setAttribute('data-js','')}
var t=localStorage.getItem('theme');
if(t==='dark'||t==='light'){d.setAttribute('data-theme',t)}
}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
