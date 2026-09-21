'use client';

import { useState } from 'react';
import { site } from '@/data/site';
import Reveal from './Reveal';

/**
 * Answers only to things this site can actually stand behind. Anything that
 * depends on a policy not yet decided is phrased as "ask us" rather than
 * invented.
 */
function questions() {
  const d = site.delivery;

  const list = [
    {
      q: 'Are the photos the real cases?',
      a:
        'Yes. Every case is photographed as it ships. Open any case and the "Real photo" ' +
        'tab shows the original, unedited shot — the artwork is never retouched.',
    },
    {
      q: 'Will it fit my phone?',
      a:
        'Each case is made for one specific handset, so the camera surround, buttons and ' +
        'port line up exactly. Send us your exact model and we will confirm the design is ' +
        'available for it before anything is made.',
    },
    {
      q: 'How do I order?',
      a:
        'Message us with the case you want and your phone model. We come back with ' +
        'availability and price, then arrange delivery.',
    },
    {
      q: `Do you deliver outside my city?`,
      a:
        d.cities.length > 0
          ? `We deliver to ${d.cities.join(', ')} regularly, and elsewhere in ${d.country} on ` +
            'request. Tell us where you are.'
          : `We ship anywhere in ${d.country}. Tell us your city and we will confirm.`,
    },
  ];

  if (d.cashOnDelivery) {
    list.push({
      q: 'Can I pay on delivery?',
      a: 'Yes — cash on delivery. You pay the courier when the case arrives.',
    });
  }

  list.push({
    q: 'Are these official BMW, Porsche or Mercedes products?',
    a:
      'No. These are aftermarket cases printed with automotive artwork. The marque names ' +
      'and logos in the designs belong to their manufacturers, and ' +
      `${site.name} is not affiliated with or endorsed by any of them.`,
  });

  return list;
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const items = questions();

  return (
    <section className="section section--tint" id="faq">
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">Questions</p>
            <h2 className="h1">Before you ask.</h2>
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
                      <span>{item.q}</span>
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
