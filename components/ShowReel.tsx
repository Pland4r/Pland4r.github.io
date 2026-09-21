'use client';

import { useTheme } from './useTheme';

/**
 * The full-width video band under the hero.
 *
 * It runs at full opacity rather than washed out behind text, so the footage
 * is the point rather than a texture.
 */
export default function ShowReel() {
  const { theme } = useTheme();
  const dir = theme === 'dark' ? '/video/dark' : '/video';

  return (
    <section className="reel" aria-label="The collection in motion">
      <video
        key={dir}
        className="reel__video"
        src={`${dir}/hero.mp4`}
        poster={`${dir}/hero-poster.webp`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="reel__fade" aria-hidden="true" />
    </section>
  );
}
