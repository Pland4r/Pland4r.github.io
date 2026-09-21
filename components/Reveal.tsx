'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Stagger this item behind the ones before it, in milliseconds. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

/**
 * Fades + lifts its children into view once, the first time they are scrolled
 * near the viewport. Falls back to "always visible" when IntersectionObserver
 * is unavailable, so nothing can ever get stuck invisible.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={delay ? ({ '--delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
