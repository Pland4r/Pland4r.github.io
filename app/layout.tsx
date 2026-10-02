import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Arabic } from 'next/font/google';
import { site } from '@/data/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

/**
 * Inter has no Arabic glyphs. Without a face that does, the Arabic pages fall
 * back to whatever the device happens to have, which sits at a different weight
 * and height from the rest of the site.
 */
const arabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
});

export const metadata: Metadata = {
  // Lets every page give its canonical and its preview image as a plain path.
  metadataBase: new URL(site.url),
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    siteName: site.name,
    type: 'website',
    url: '/',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Runs before paint.
 *
 * It also mirrors the page's language onto <html>, which this layout cannot do
 * itself: the layout is shared by all three languages and does not know which
 * one is being served. The wrapper inside <body> carries `lang` and `dir` in
 * the markup, so a reader with no scripting still gets the right direction —
 * this only adds what an attribute on <html> buys on top, which is the
 * scrollbar and the browser's own controls. Until this marks the document, `.reveal` blocks stay fully
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
var p=location.pathname.split('/')[1];
if(p==='fr'||p==='ar'){d.lang=p;d.dir=p==='ar'?'rtl':'ltr'}
}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${arabic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        {children}
        {/* Only ever on the page when a token has been set. */}
        {site.analytics ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${site.analytics}"}`}
          />
        ) : null}
      </body>
    </html>
  );
}
