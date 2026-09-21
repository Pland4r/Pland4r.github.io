import { cases } from '@/data/cases';

export default function Ticker() {
  const items = cases.map((c) => `${c.marque} ${c.model}`);
  // The track is duplicated so the -50% keyframe lands on a seamless loop point.
  const track = [...items, ...items];

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {track.map((label, i) => (
          <span className="ticker__item" key={`${label}-${i}`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
