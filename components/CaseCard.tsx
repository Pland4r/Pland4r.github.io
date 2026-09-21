'use client';

import { useCallback, useRef, useState } from 'react';
import type { Case } from '@/data/cases';
import { formatPrice } from '@/data/site';
import Drips from './Drips';
import { ArrowRight } from './Icons';
import { useTheme } from './useTheme';

type Props = {
  item: Case;
  onOpen: (slug: string) => void;
};

/** The dot on each card's shell badge. Keyed by `shell` in data/cases.ts. */
const SWATCH: Record<Case['shell'], string> = {
  white: '#f4f6f8',
  black: '#0c0d10',
  pink: '#c9829a',
};

/**
 * A product tile. The still image is what loads; the 6-second clip only starts
 * on hover or keyboard focus, so a visitor on mobile data never pays for six
 * videos up front.
 */
export default function CaseCard({ item, onOpen }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // The clips are rendered on both a light and a dark stage; play the one that
  // matches the page so a bright clip never flashes inside a dark card.
  const { theme } = useTheme();
  const clip = theme === 'dark' ? `/video/dark/${item.slug}.mp4` : `/video/${item.slug}.mp4`;

  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => setPlaying(true))
      .catch(() => {
        /* autoplay refused — the still stays up, which is a fine fallback */
      });
  }, []);

  // A soft light that follows the cursor across the tile.
  const spotlight = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  const stop = useCallback(() => {
    const v = videoRef.current;
    setPlaying(false);
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, []);

  return (
    <button
      type="button"
      className={`card ${playing ? 'is-playing' : ''}`}
      style={{ '--card-accent': item.accent } as React.CSSProperties}
      onMouseEnter={start}
      onPointerMove={spotlight}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      onClick={() => onOpen(item.slug)}
      aria-label={`${item.marque} ${item.model} — open details`}
    >
      <span className="card__shellbadge">
        <span
          className="card__swatch"
          style={{ background: SWATCH[item.shell] }}
        />
        {item.shellLabel}
      </span>

      <span className="card__stage">
        <img
          className="card__still"
          src={`/cases/${item.slug}-md.webp`}
          alt={`${item.marque} ${item.model} phone case`}
          loading="lazy"
          decoding="async"
          width={513}
          height={900}
        />
        <video
          ref={videoRef}
          className="card__clip"
          src={clip}
          key={clip}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          aria-hidden="true"
        />
        <Drips />
      </span>

      <span className="card__body">
        <span className="card__marque">{item.marque}</span>
        <span className="card__model">{item.model}</span>
        <span className="card__caption">{item.caption}</span>

        <span className="card__foot">
          <span className="card__price">{formatPrice()}</span>
          <span className="card__cta">
            Details <ArrowRight />
          </span>
        </span>
      </span>
    </button>
  );
}
