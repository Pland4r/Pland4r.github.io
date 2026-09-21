'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`totop ${show ? 'is-in' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M7 11.5V2.5M3 6.5l4-4 4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
