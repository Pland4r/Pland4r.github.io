'use client';

import { useCallback, useRef, useState } from 'react';
import type { Case } from '@/data/cases';
import { getCopy, path, type Locale } from '@/data/i18n';
import { formatPrice } from '@/data/site';
import Drips from './Drips';
import { ArrowRight } from './Icons';
import { useTheme } from './useTheme';
import { rev } from '../data/rev';

type Props = {
  item: Case;
  onOpen: (slug: string) => void;
  locale: Locale;
};

/**
 * A product tile. The still image is what loads; the 6-second clip only starts
 * on hover or keyboard focus, so a visitor on mobile data never pays for six
 * videos up front.
 */
export default function CaseCard({ item, onOpen, locale }: Props) {
  const copy = getCopy(locale);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // The clips are rendered on both a light and a dark stage; play the one that
  // matches the page so a bright clip never flashes inside a dark card.
  const { theme } = useTheme();
  const dir = theme === 'dark' ? '/video/dark' : '/video';
  const clip = `${dir}/${item.slug}.mp4${rev(item.slug)}`;

  const start = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => setPlaying(true))
      .catch(() => {
        /* autoplay refused — the still stays up, which is a fine fallback */
      });
  }, []);

  /**
   * The card is a real link to the case's own page, so it can be copied, sent
   * and crawled. A plain click is intercepted and opens the sheet instead,
   * which is the nicer way to browse — but only a plain one: a modified click
   * or a middle click still means "open that page", and taking it over would
   * break the one thing the link is there for.
   */
  const openHere = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      onOpen(item.slug);
    },
    [item.slug, onOpen],
  );

  // A soft light that follows the cursor across the tile.
  const spotlight = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
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
    <a
      href={path(locale, `${item.slug}/`)}
      className={`card ${playing ? 'is-playing' : ''}`}
      style={{ '--card-accent': item.accent } as React.CSSProperties}
      onMouseEnter={start}
      onPointerMove={spotlight}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      onClick={openHere}
      aria-label={copy.card.open(item.marque, item.model)}
    >
      <span className="card__shellbadge">
        <span
          className="card__swatch"
          style={{ background: item.swatch }}
        />
        {item.shellLabel}
      </span>

      <span className="card__stage">
        <img
          className="card__still"
          src={`/cases/${item.slug}-md.webp${rev(item.slug)}`}
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
          <span className="card__price">{formatPrice(copy)}</span>
          <span className="card__cta">
            {copy.card.details} <ArrowRight />
          </span>
        </span>
      </span>
    </a>
  );
}
