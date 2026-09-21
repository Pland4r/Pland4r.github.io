'use client';

import { useTheme } from './useTheme';

export default function ThemeToggle() {
  const { theme, toggle, ready } = useTheme();
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      className="themetoggle"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      // Until the client has read the real theme the icon would be a guess,
      // so it stays invisible rather than flipping on hydration.
      style={{ opacity: ready ? 1 : 0 }}
    >
      <span className="themetoggle__track">
        <span className="themetoggle__thumb" data-dark={dark || undefined}>
          {dark ? <Moon /> : <Sun />}
        </span>
      </span>
    </button>
  );
}

function Sun() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.2v1.6M8 13.2v1.6M14.8 8h-1.6M2.8 8H1.2M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1M12.8 12.8l-1.1-1.1M4.3 4.3 3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Moon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.2 9.9A5.6 5.6 0 0 1 6.1 2.8a5.6 5.6 0 1 0 7.1 7.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
