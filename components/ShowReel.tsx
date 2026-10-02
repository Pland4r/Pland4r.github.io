'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from './useTheme';
import { getCopy, type Locale } from '@/data/i18n';
import { rev } from '@/data/rev';

/**
 * The full-width video band under the hero.
 *
 * It runs at full opacity rather than washed out behind text, so the footage
 * is the point rather than a texture.
 *
 * The clip is the single heaviest thing on the page — around 700 KB, several
 * times the HTML and the script together — and `autoPlay` fetches it the moment
 * the page is parsed, in competition with the fonts and the case stills that
 * the visitor is actually waiting to see. On a Moroccan mobile connection that
 * is both slow and other people's money.
 *
 * So the source is withheld until the band is near the viewport, which is what
 * `preload="none"` cannot do on its own: nothing is requested, and when it is,
 * the critical render is already done. The poster is a still of the first frame
 * and loads immediately, so the band is never an empty hole.
 */
export default function ShowReel({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const { theme } = useTheme();
  const dir = theme === 'dark' ? '/video/dark' : '/video';
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const band = ref.current;
    // No IntersectionObserver means an old browser, which should still get the
    // reel — just without the deferral.
    if (!band || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      // A screen's warning, so it is loaded by the time it is looked at.
      { rootMargin: '100% 0px' },
    );
    io.observe(band);
    return () => io.disconnect();
  }, []);

  return (
    <section className="reel" aria-label={copy.reel.label} ref={ref}>
      <video
        key={`${dir}-${near}`}
        className="reel__video"
        src={near ? `${dir}/hero.mp4${rev('hero')}` : undefined}
        poster={`${dir}/hero-poster.webp${rev('hero')}`}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
      <div className="reel__fade" aria-hidden="true" />
    </section>
  );
}
