'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, getCase } from '@/data/cases';
import { getCopy, type Locale } from '@/data/i18n';
import CaseCard from './CaseCard';
import CaseSheet from './CaseSheet';
import Reveal from './Reveal';

const ALL = 'All';

export default function Collection({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const cases = useMemo(() => collection(locale), [locale]);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(ALL);

  const marques = useMemo(() => [ALL, ...Array.from(new Set(cases.map((c) => c.marque)))], [cases]);
  const shown = useMemo(
    () => (filter === ALL ? cases : cases.filter((c) => c.marque === filter)),
    [cases, filter],
  );

  const close = useCallback(() => setOpen(null), []);

  // The hero case asks for a sheet by dispatching this, so it does not need to
  // own or import any of the collection's state.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (getCase(slug, locale)) setOpen(slug);
    };
    window.addEventListener('macases:open', onOpen);
    return () => window.removeEventListener('macases:open', onOpen);
  }, [locale]);
  const active = open ? getCase(open, locale) : undefined;

  return (
    <section className="section" id="collection">
      <div className="glassfield" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">{copy.collection.eyebrow}</p>
            <h2 className="h1">{copy.collection.heading(cases.length)}</h2>
            <p className="lede">{copy.collection.lede}</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="viewtabs" role="group" aria-label={copy.collection.filterLabel}>
              {marques.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={filter === m}
                  onClick={() => setFilter(m)}
                >
                  {m === ALL ? copy.collection.all : m}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid">
          {shown.map((item, i) => (
            <Reveal key={item.slug} delay={i * 70}>
              <CaseCard item={item} onOpen={setOpen} locale={locale} />
            </Reveal>
          ))}
        </div>
      </div>

      {active ? <CaseSheet item={active} onClose={close} locale={locale} /> : null}
    </section>
  );
}
