import { cases } from '@/data/cases';
import { getCopy, path, type Locale } from '@/data/i18n';
import HeroCase from './HeroCase';
import { ArrowRight } from './Icons';
import Reveal from './Reveal';

/** The case that fronts the site. Change the slug to lead with a different one. */
const HERO_CASE = 'porsche-911-gt2-rs';

export default function Hero({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const marques = Array.from(new Set(cases.map((c) => c.marque)));
  // Derived, so adding a case in a new shell colour updates the hero by itself.
  const shells = Array.from(new Set(cases.map((c) => c.shellLabel)));
  const lead = cases.find((c) => c.slug === HERO_CASE) ?? cases[0];

  return (
    <section className="hero" id="top">
      <div className="aurora" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div className="wrap hero__inner">
        <div className="hero__split">
          <div className="hero__copy">
            <Reveal>
              <p className="hero__eyebrow">
                <span className="hero__dot" aria-hidden="true" />
                {copy.hero.inStock(cases.length)}
              </p>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="h-display hero__title">
                <span>{copy.hero.titleTop}</span>
                <span className="line-2">{copy.hero.titleBottom}</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="lede hero__lede">{copy.hero.lede}</p>
            </Reveal>

            <Reveal delay={260}>
              <div className="hero__actions">
                <a href={`${path(copy.locale)}#collection`} className="btn btn--primary">
                  {copy.hero.seeCollection} <ArrowRight />
                </a>
                <a href={`${path(copy.locale)}#craft`} className="btn btn--ghost">
                  {copy.hero.howMade}
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="hero__art">
            <HeroCase item={lead} locale={locale} />
          </Reveal>
        </div>

        <Reveal delay={340}>
          <dl className="hero__meta">
            <div>
              <dt>{copy.hero.metaCollection}</dt>
              <dd>{copy.hero.metaDesigns(cases.length)}</dd>
            </div>
            <div>
              <dt>{copy.hero.metaMarques}</dt>
              <dd>{marques.join(' · ')}</dd>
            </div>
            <div>
              <dt>{copy.hero.metaShells}</dt>
              <dd>{shells.join(' / ')}</dd>
            </div>
            <div>
              <dt>{copy.hero.metaImagery}</dt>
              <dd>{copy.hero.metaImageryValue}</dd>
            </div>
          </dl>
        </Reveal>
      </div>

      <div className="scrollcue" aria-hidden="true">
        <span className="scrollcue__rail" />
        <span className="mono">{copy.hero.scroll}</span>
      </div>
    </section>
  );
}
