'use client';

import { useCallback, useEffect, useState } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '#collection', label: 'Collection' },
  { href: '#craft', label: 'Made' },
  { href: '#fit', label: 'Fit' },
  { href: '#delivery', label: 'Delivery' },
  { href: '#faq', label: 'Questions' },
];

export default function Nav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes, and the page behind must not scroll under the open panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.classList.add('is-locked');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
    };
  }, [open]);

  // Rotating the phone to landscape can cross the breakpoint with the panel
  // still open, leaving it stuck over a desktop-width layout.
  useEffect(() => {
    const onResize = () => window.innerWidth > 720 && setOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return (
    <header className={`nav ${stuck || open ? 'is-stuck' : ''}`}>
      <div className="wrap nav__inner">
        <Logo size={38} />

        <nav className="nav__links" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <ThemeToggle />
          <a href="#contact" className="btn btn--ghost btn--sm nav__cta">
            Get in touch
          </a>
          <button
            type="button"
            className={`burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-panel"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`navpanel ${open ? 'is-open' : ''}`} id="nav-panel" hidden={!open}>
        <nav className="navpanel__links" aria-label="Sections">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              style={{ '--i': i } as React.CSSProperties}
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" onClick={close} style={{ '--i': LINKS.length } as React.CSSProperties}>
            Get in touch
          </a>
        </nav>
      </div>

      {open ? <button className="navpanel__scrim" onClick={close} aria-label="Close menu" tabIndex={-1} /> : null}
    </header>
  );
}
