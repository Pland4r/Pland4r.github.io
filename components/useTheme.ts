'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** What the document is actually painted as right now. */
function read(): Theme {
  if (typeof document === 'undefined') return 'light';
  const chosen = document.documentElement.getAttribute('data-theme');
  if (chosen === 'dark' || chosen === 'light') return chosen;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Reads and sets the theme.
 *
 * Components that swap an asset per theme (the product clips are rendered on
 * both a light and a dark stage) subscribe here, so a toggle anywhere updates
 * all of them. Starts as 'light' on the server and corrects after mount, which
 * is what keeps the markup hydration-safe.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(read());
    setReady(true);

    // Another component toggling, or the OS switching while we sit unset.
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystem = () => setTheme(read());
    media.addEventListener('change', onSystem);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', onSystem);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* private mode — the choice just will not persist */
    }
  }, []);

  return { theme, toggle, ready };
}
