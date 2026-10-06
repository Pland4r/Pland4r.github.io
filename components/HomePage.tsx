import type { Locale } from '@/data/i18n';
import Assistant from './Assistant';
import BackToTop from './BackToTop';
import Collection from './Collection';
import Contact from './Contact';
import Craft from './Craft';
import Delivery from './Delivery';
import Faq from './Faq';
import Fit from './Fit';
import Footer from './Footer';
import Hero from './Hero';
import Nav from './Nav';
import Page from './Page';
import ScrollProgress from './ScrollProgress';
import ShowReel from './ShowReel';
import Ticker from './Ticker';

/**
 * The collection page, in one language.
 *
 * Each locale's route is three lines that call this, rather than three copies
 * of the page that can drift apart.
 */
export default function HomePage({ locale }: { locale: Locale }) {
  return (
    <Page locale={locale}>
      <ScrollProgress />
      <Nav locale={locale} />
      <main>
        <Hero locale={locale} />
        <ShowReel locale={locale} />
        <Ticker />
        <Collection locale={locale} />
        <Craft locale={locale} />
        <Fit locale={locale} />
        <Delivery locale={locale} />
        <Faq locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
      <BackToTop locale={locale} />
      <Assistant locale={locale} />
    </Page>
  );
}
