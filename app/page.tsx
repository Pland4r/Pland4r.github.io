import BackToTop from '@/components/BackToTop';
import Collection from '@/components/Collection';
import Contact from '@/components/Contact';
import Delivery from '@/components/Delivery';
import Faq from '@/components/Faq';
import Craft from '@/components/Craft';
import Fit from '@/components/Fit';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Nav from '@/components/Nav';
import ScrollProgress from '@/components/ScrollProgress';
import ShowReel from '@/components/ShowReel';
import Ticker from '@/components/Ticker';

export default function Page() {
  return (
    <>
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <ShowReel />
        <Ticker />
        <Collection />
        <Craft />
        <Fit />
        <Delivery />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
