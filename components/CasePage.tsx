import type { Case } from '@/data/cases';
import { everyPath, getCopy, path, type Locale } from '@/data/i18n';
import { site } from '@/data/site';
import BackToTop from './BackToTop';
import CaseDetail from './CaseDetail';
import Contact from './Contact';
import Footer from './Footer';
import { ArrowRight } from './Icons';
import Nav from './Nav';
import Page from './Page';
import ScrollProgress from './ScrollProgress';

/** One case on its own page, in one language. */
export default function CasePage({ item, locale }: { item: Case; locale: Locale }) {
  const copy = getCopy(locale);
  const home = path(locale);

  return (
    <Page locale={locale}>
      <ScrollProgress />
      <Nav locale={locale} alternates={everyPath(`${item.slug}/`)} />
      <main>
        <section
          className="section casepage"
          style={{ '--sheet-accent': item.accent } as React.CSSProperties}
        >
          <div className="wrap">
            <a href={`${home}#collection`} className="casepage__back">
              <span aria-hidden="true">{copy.dir === 'rtl' ? '→' : '←'}</span>{' '}
              {copy.casePage.back}
            </a>

            <div className="casepage__panel">
              <CaseDetail item={item} locale={locale} askHref={`${home}#contact`} />
            </div>

            <a href={`${home}#collection`} className="casepage__more">
              {copy.casePage.more} <ArrowRight />
            </a>
          </div>
        </section>
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
      <BackToTop locale={locale} />

      {/* Lets a search engine show the case as a product rather than a page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `${item.marque} ${item.model}`,
            brand: { '@type': 'Brand', name: site.name },
            color: item.shellLabel,
            image: `${site.url}/og/${item.slug}.jpg`,
            inLanguage: locale,
            ...(item.blurb ? { description: item.blurb } : {}),
            ...(site.price === null
              ? {}
              : {
                  offers: {
                    '@type': 'Offer',
                    price: site.price,
                    priceCurrency: 'MAD',
                    availability: 'https://schema.org/InStock',
                  },
                }),
          }),
        }}
      />
    </Page>
  );
}
