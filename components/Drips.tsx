/**
 * Condensation running down the glass.
 *
 * Positions and timings come from a fixed hash of the index rather than
 * Math.random, so the server and the client render identical markup — random
 * values here would be a hydration mismatch.
 */

const COUNT = 7;

/**
 * Deterministic 0..1 from two integers, using integer ops only.
 *
 * Deliberately not `Math.sin(...)`: transcendental results are allowed to
 * differ in the last bits between engines, so the server and the browser can
 * format the same expression to different strings — which React reports as a
 * hydration mismatch. Integer maths is bit-identical everywhere.
 */
function noise(i: number, salt: number) {
  let x = (i * 374761393 + salt * 668265263) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) % 1000 / 1000;
}

/** Fixed decimals for the same reason: no float formatting differences. */
const px = (n: number) => `${n.toFixed(2)}px`;
const pct = (n: number) => `${n.toFixed(2)}%`;
const sec = (n: number) => `${n.toFixed(2)}s`;

export default function Drips({ count = COUNT }: { count?: number }) {
  return (
    <span className="drips" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const size = 4 + noise(i, 1) * 7;
        return (
          <span
            key={i}
            className="drip"
            style={
              {
                '--x': pct(6 + noise(i, 2) * 88),
                '--size': px(size),
                '--tall': (1.15 + noise(i, 5) * 0.5).toFixed(2),
                '--start': pct(noise(i, 3) * 30),
                '--fall': pct(40 + noise(i, 4) * 45),
                '--dur': sec(5.5 + noise(i, 6) * 6),
                '--delay': sec(noise(i, 7) * -9),
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}
