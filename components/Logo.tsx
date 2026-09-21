import { site } from '@/data/site';

/** Natural size of the extracted mark, for correct aspect reservation. */
const W = 798;
const H = 481;

type Props = {
  /** Rendered height in px. */
  size?: number;
  className?: string;
};

/**
 * The MA emblem.
 *
 * Two files rather than one recoloured with CSS filters: the mark carries a red
 * arch and a green star that have to survive the theme swap, and a filter that
 * flips the white letters would wreck both. Which one shows is pure CSS, so
 * this stays a server component.
 */
export default function Logo({ size = 30, className = '' }: Props) {
  const width = Math.round((W / H) * size);

  return (
    <a href="#top" className={`logo ${className}`.trim()} aria-label={`${site.name} — home`}>
      <img
        className="logo__mark logo__mark--onlight"
        src="/brand/ma-mark-on-light.png"
        alt=""
        width={width}
        height={size}
        style={{ height: size, width }}
      />
      <img
        className="logo__mark logo__mark--ondark"
        src="/brand/ma-mark-on-dark.png"
        alt=""
        width={width}
        height={size}
        style={{ height: size, width }}
      />
    </a>
  );
}
