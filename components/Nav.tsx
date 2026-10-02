'use client';

import { useCallback, useEffect, useState } from 'react';
import { LOCALES, getCopy, path, type Copy, type Locale } from '@/data/i18n';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

/**
 * Rooted at the language's own home, not bare fragments: these sections only
 * exist on the home page, and the nav also sits on top of every case page,
 * where `#collection` would point at nothing and the link would do nothing when
 * tapped. From the home page `/#collection` still scrolls rather than reloading.
 *
 * "Get in touch" stays a bare `#contact` on purpose — the contact section is on
 * both, so it should scroll down rather than leave the case you are looking at.
 */
const sections = (copy: Copy) => {
  const home = path(copy.locale);
  return [
    { id: 'collection', href: `${home}#collection`, label: copy.nav.collection },
    { id: 'craft', href: `${home}#craft`, label: copy.nav.made },
    { id: 'fit', href: `${home}#fit`, label: copy.nav.fit },
    { id: 'delivery', href: `${home}#delivery`, label: copy.nav.delivery },
    { id: 'faq', href: `${home}#faq`, label: copy.nav.questions },
  ];
};

type Props = {
  locale: Locale;
  /**
   * Where each language's version of *this* page is. A case page knows its own
   * slug; the home page passes nothing. Without it the switcher would drop a
   * reader back to the home page every time they changed language.
   */
  alternates?: Record<string, string>;
};

export default function Nav({ locale, alternates }: Props) {
  const copy = getCopy(locale);
  const LINKS = sections(copy);
  const switchTo = (l: Locale) => alternates?.[l] ?? path(l);
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

        <nav className="nav__links" aria-label={copy.nav.collection}>
          {LINKS.map((l) => (
            <a key={l.id} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <nav className="langs" aria-label={copy.nav.language}>
            {LOCALES.map((l) => (
              <a
                key={l}
                href={switchTo(l)}
                lang={l}
                hrefLang={l}
                aria-current={l === copy.locale ? 'true' : undefined}
              >
                {getCopy(l).endonym}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <a href="#contact" className="btn btn--ghost btn--sm nav__cta">
            {copy.nav.getInTouch}
          </a>
          <button
            type="button"
            className={`burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-panel"
            aria-label={open ? copy.nav.closeMenu : copy.nav.openMenu}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`navpanel ${open ? 'is-open' : ''}`} id="nav-panel" hidden={!open}>
        <nav className="navpanel__links" aria-label={copy.nav.collection}>
          {LINKS.map((l, i) => (
            <a
              key={l.id}
              href={l.href}
              onClick={close}
              style={{ '--i': i } as React.CSSProperties}
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" onClick={close} style={{ '--i': LINKS.length } as React.CSSProperties}>
            {copy.nav.getInTouch}
          </a>

          <span className="navpanel__langs" style={{ '--i': LINKS.length + 1 } as React.CSSProperties}>
            {LOCALES.map((l) => (
              <a
                key={l}
                href={switchTo(l)}
                lang={l}
                hrefLang={l}
                onClick={close}
                aria-current={l === copy.locale ? 'true' : undefined}
              >
                {getCopy(l).endonym}
              </a>
            ))}
          </span>
        </nav>
      </div>

      {open ? <button className="navpanel__scrim" onClick={close} aria-label={copy.nav.closeMenu} tabIndex={-1} /> : null}
    </header>
  );
}
