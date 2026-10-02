'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LOCALE, LOCALES, getCopy, path, type Locale } from '@/data/i18n';
import BackToTop from './BackToTop';
import Collection from './Collection';
import Contact from './Contact';
import Footer from './Footer';
import { ArrowRight } from './Icons';
import Nav from './Nav';
import Page from './Page';

/**
 * What a broken link lands on.
 *
 * It is one page for the whole site, because a static export has nothing
 * running to route on. So it reads the language out of the address instead:
 * someone whose Arabic link has gone stale should not be dropped into English
 * on top of it.
 *
 * It renders in the default language first and corrects itself on hydration,
 * which is the right way round — the correction is a swap of words on a page
 * that already looks like the site, not a blank one waiting for a script.
 *
 * The collection is underneath on purpose. A dead end on a shop is a wasted
 * visit, and this list is short enough to be the way back in.
 */
export default function NotFound() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const first = window.location.pathname.split('/')[1];
    if ((LOCALES as readonly string[]).includes(first)) setLocale(first as Locale);
  }, []);

  const copy = getCopy(locale);

  return (
    <Page locale={locale}>
      <Nav locale={locale} />
      <main>
        <section className="section notfound">
          <div className="wrap">
            <p className="notfound__code mono">{copy.notFound.code}</p>
            <h1 className="h1">{copy.notFound.heading}</h1>
            <p className="lede">{copy.notFound.lede}</p>
            <a href={`${path(locale)}#collection`} className="btn btn--primary">
              {copy.notFound.cta} <ArrowRight />
            </a>
          </div>
        </section>
        <Collection locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
      <BackToTop locale={locale} />
    </Page>
  );
}
