'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Case } from '@/data/cases';

/** How far the case turns at the edges of the stage. */
const MAX_DEG = 34;

/** How fast the rendered angle chases the pointer. Lower = heavier. */
const EASE = 0.12;

type Props = { item: Case };

/**
 * Turns the case left and right, following the pointer.
 *
 * This is the real product photo under a CSS 3D rotation — full resolution,
 * smooth at any angle, and no generated frames to go soft or fall out of sync
 * with the artwork.
 */
export default function TiltView({ item }: Props) {
  const [deg, setDeg] = useState(0);

  const target = useRef(0);
  const current = useRef(0);
  const engaged = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const started = performance.now();

    const tick = (now: number) => {
      // Until someone interacts, rock gently so it reads as interactive.
      if (!engaged.current) {
        target.current = Math.sin((now - started) / 1500) * 0.6;
      }

      current.current += (target.current - current.current) * EASE;
      const next = Math.round(current.current * MAX_DEG * 10) / 10;
      setDeg((prev) => (prev === next ? prev : next));

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const aim = useCallback((clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    engaged.current = true;
    target.current = Math.max(-1, Math.min(1, ((clientX - r.left) / r.width) * 2 - 1));
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => aim(e.clientX, e.currentTarget),
    [aim],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      aim(e.clientX, e.currentTarget);
    },
    [aim],
  );

  // Settle back to face-on rather than freezing at an angle nobody chose.
  const onPointerLeave = useCallback(() => {
    target.current = 0;
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    engaged.current = true;
    target.current = Math.max(-1, Math.min(1, target.current + (e.key === 'ArrowRight' ? 0.18 : -0.18)));
  }, []);

  const t = deg / MAX_DEG;

  return (
    <div
      className="tilt"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      role="slider"
      tabIndex={0}
      aria-label={`Turn the ${item.marque} ${item.model} case`}
      aria-valuemin={-MAX_DEG}
      aria-valuemax={MAX_DEG}
      aria-valuenow={Math.round(deg)}
      aria-valuetext={`${Math.abs(Math.round(deg))} degrees ${
        Math.round(deg) === 0 ? 'face on' : deg < 0 ? 'left' : 'right'
      }`}
    >
      <img
        className="tilt__case"
        src={`/cases/${item.slug}.webp`}
        alt={`${item.marque} ${item.model} phone case`}
        draggable={false}
        style={{
          transform: `perspective(1500px) rotateY(${deg}deg)`,
          // The shadow swings the opposite way, and the face dims a little as
          // it turns away from the light.
          filter: `drop-shadow(${-t * 26}px 26px 26px rgba(0,0,0,${0.3 - Math.abs(t) * 0.08}))
                   brightness(${1 - Math.abs(t) * 0.07})`,
        }}
      />
    </div>
  );
}
