import { cases } from '@/data/cases';
import HeroCase from './HeroCase';
import { ArrowRight } from './Icons';
import Reveal from './Reveal';

/** The case that fronts the site. Change the slug to lead with a different one. */
const HERO_CASE = 'porsche-911-gt2-rs';

export default function Hero() {
  const marques = Array.from(new Set(cases.map((c) => c.marque)));
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
                {cases.length} cases in stock now
              </p>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="h-display hero__title">
                <span>Drive it</span>
                <span className="line-2">on your phone.</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="lede hero__lede">
                Automotive artwork printed edge to edge on a hard shell. Every case on
                this site is shown in its own photograph — what you see is the case you
                get.
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="hero__actions">
                <a href="#collection" className="btn btn--primary">
                  See the collection <ArrowRight />
                </a>
                <a href="#craft" className="btn btn--ghost">
                  How they are made
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="hero__art">
            <HeroCase item={lead} />
          </Reveal>
        </div>

        <Reveal delay={340}>
          <dl className="hero__meta">
            <div>
              <dt>Collection</dt>
              <dd>{cases.length} designs</dd>
            </div>
            <div>
              <dt>Marques</dt>
              <dd>{marques.join(' · ')}</dd>
            </div>
            <div>
              <dt>Shells</dt>
              <dd>Gloss white / gloss black</dd>
            </div>
            <div>
              <dt>Imagery</dt>
              <dd>Real photos, no renders</dd>
            </div>
          </dl>
        </Reveal>
      </div>

      <div className="scrollcue" aria-hidden="true">
        <span className="scrollcue__rail" />
        <span className="mono">SCROLL</span>
      </div>
    </section>
  );
}
