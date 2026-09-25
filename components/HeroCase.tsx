'use client';

import { useCallback, useRef, useState } from 'react';
import type { Case } from '@/data/cases';
import { rev } from '@/data/rev';

type Props = { item: Case };

type Ripple = { id: number; x: number; y: number };

/** Long enough for the spin to read, short enough not to feel like a wait. */
const SPIN_MS = 820;

/**
 * The hero case. Clicking it sends a ripple out from the point you hit, spins
 * the case once, then opens its detail sheet.
 *
 * The sheet is owned by <Collection>, so rather than lifting that state into a
 * context for one interaction, the open request goes out as a DOM event.
 */
export default function HeroCase({ item }: Props) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [spinning, setSpinning] = useState(false);
  const seq = useRef(0);
  const timer = useRef<number | null>(null);

  const burst = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      const id = ++seq.current;
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;

      setRipples((list) => [...list, { id, x, y }]);
      window.setTimeout(() => setRipples((list) => list.filter((p) => p.id !== id)), 1400);

      if (!spinning) {
        setSpinning(true);
        timer.current = window.setTimeout(() => {
          setSpinning(false);
          window.dispatchEvent(new CustomEvent('macases:open', { detail: item.slug }));
        }, SPIN_MS);
      }
    },
    [item.slug, spinning],
  );

  return (
    <button
      type="button"
      className={`herocase ${spinning ? 'is-spinning' : ''}`}
      onClick={burst}
      aria-label={`${item.marque} ${item.model} — open details`}
    >
      <span className="herocase__inner">
        <img
          src={`/cases/${item.slug}.webp${rev(item.slug)}`}
          alt={`${item.marque} ${item.model} phone case`}
          width={514}
          height={989}
          fetchPriority="high"
        />
      </span>

      {ripples.map((p) => (
        <span
          key={p.id}
          className="ripple"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className="ripple__ring" />
          <span className="ripple__ring" />
          <span className="ripple__ring" />
        </span>
      ))}

      <span className="herocase__hint">Tap it</span>
    </button>
  );
}
