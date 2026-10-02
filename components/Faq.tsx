'use client';

import { useState } from 'react';
import { getCopy, type Copy, type Locale } from '@/data/i18n';
import { site } from '@/data/site';
import Reveal from './Reveal';

/**
 * Answers only to things this site can actually stand behind. Anything that
 * depends on a policy not yet decided is phrased as "ask us" rather than
 * invented.
 */
function questions(copy: Copy) {
  const d = site.delivery;
  const country = copy.countryName(d.country);

  const list = [
    { q: copy.faq.photosQ, a: copy.faq.photosA },
    { q: copy.faq.fitQ, a: copy.faq.fitA },
    { q: copy.faq.orderQ, a: copy.faq.orderA },
    {
      q: copy.faq.outsideQ,
      a:
        d.cities.length > 0
          ? copy.faq.outsideCities(d.cities.join(', '), country)
          : copy.faq.outsideAnywhere(country),
    },
  ];

  if (d.cashOnDelivery) {
    list.push({ q: copy.faq.codQ, a: copy.faq.codA });
  }

  list.push({ q: copy.faq.officialQ, a: copy.faq.officialA(site.name) });

  return list;
}

export default function Faq({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [open, setOpen] = useState<number | null>(0);
  const items = questions(copy);

  return (
    <section className="section section--tint" id="faq">
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">{copy.faq.eyebrow}</p>
            <h2 className="h1">{copy.faq.heading}</h2>
          </Reveal>
        </div>

        <Reveal>
          <div className="faq">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div className={`faq__item ${isOpen ? 'is-open' : ''}`} key={item.q}>
                  <h3 className="faq__q">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      id={`faq-q-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      {item.q}
                      <span className="faq__sign" aria-hidden="true" />
                    </button>
                  </h3>
                  <div
                    className="faq__a"
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    hidden={!isOpen}
                  >
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
