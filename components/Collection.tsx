'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cases, getCase } from '@/data/cases';
import { Spell } from '@/data/count';
import CaseCard from './CaseCard';
import CaseSheet from './CaseSheet';
import Reveal from './Reveal';

const ALL = 'All';

export default function Collection() {
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(ALL);

  const marques = useMemo(() => [ALL, ...Array.from(new Set(cases.map((c) => c.marque)))], []);
  const shown = useMemo(
    () => (filter === ALL ? cases : cases.filter((c) => c.marque === filter)),
    [filter],
  );

  const close = useCallback(() => setOpen(null), []);

  // The hero case asks for a sheet by dispatching this, so it does not need to
  // own or import any of the collection's state.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const slug = (e as CustomEvent<string>).detail;
      if (getCase(slug)) setOpen(slug);
    };
    window.addEventListener('macases:open', onOpen);
    return () => window.removeEventListener('macases:open', onOpen);
  }, []);
  const active = open ? getCase(open) : undefined;

  return (
    <section className="section" id="collection">
      <div className="glassfield" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">The collection</p>
            <h2 className="h1">
              {Spell(cases.length)} cars. {Spell(cases.length)} cases.
            </h2>
            <p className="lede">
              Open any case for the artwork breakdown, a 3D turn you can move, and the
              untouched product photo.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="viewtabs" role="group" aria-label="Filter by marque">
              {marques.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={filter === m}
                  onClick={() => setFilter(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid">
          {shown.map((item, i) => (
            <Reveal key={item.slug} delay={i * 70}>
              <CaseCard item={item} onOpen={setOpen} />
            </Reveal>
          ))}
        </div>
      </div>

      {active ? <CaseSheet item={active} onClose={close} /> : null}
    </section>
  );
}
