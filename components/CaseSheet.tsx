'use client';

import { useEffect, useRef, useState } from 'react';
import type { Case } from '@/data/cases';
import { formatPrice, site } from '@/data/site';
import { Close } from './Icons';
import TiltView from './TiltView';
import { useTheme } from './useTheme';

type Props = {
  item: Case;
  onClose: () => void;
};

type View = 'motion' | 'tilt' | 'photo';

const VIEWS: { id: View; label: string }[] = [
  { id: 'motion', label: 'Motion' },
  { id: 'tilt', label: '3D' },
  { id: 'photo', label: 'Real photo' },
];

const NOTES: Record<View, string> = {
  motion:
    'The motion view is this case’s own photograph lit on a studio background. The artwork itself is never altered.',
  tilt:
    'The 3D view is this case’s own photograph at full resolution, turned left and right. Nothing is redrawn or re-rendered.',
  photo: 'This is the original, unedited photograph of this exact case.',
};

export default function CaseSheet({ item, onClose }: Props) {
  const [view, setView] = useState<View>('motion');
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const clipDir = theme === 'dark' ? '/video/dark' : '/video';

  // Reset to the motion view whenever a different case is opened.
  useEffect(() => setView('motion'), [item.slug]);

  useEffect(() => {
    const restoreTo = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.classList.add('is-locked');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // The dialog says aria-modal, so Tab has to stay inside it.
      if (e.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      restoreTo?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="sheet"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.marque} ${item.model}`}
      style={{ '--sheet-accent': item.accent } as React.CSSProperties}
    >
      <div className="sheet__scrim" onClick={onClose} />

      <div className="sheet__panel" ref={panelRef}>
        <button ref={closeRef} type="button" className="sheet__close" onClick={onClose} aria-label="Close">
          <Close />
        </button>

        <div className="sheet__grid">
          <div>
            <div className={`sheet__media ${view === 'tilt' ? 'sheet__media--bare' : ''}`}>
              {view === 'motion' ? (
                <video
                  key={`${item.slug}-${theme}`}
                  src={`${clipDir}/${item.slug}.mp4`}
                  poster={`${clipDir}/${item.slug}-poster.webp`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : view === 'tilt' ? (
                <TiltView item={item} />
              ) : (
                <img
                  className="is-photo"
                  src={`/cases/photo/${item.slug}.webp`}
                  alt={`Unretouched photograph of the ${item.marque} ${item.model} case`}
                />
              )}
            </div>

            <div className="viewtabs" role="group" aria-label="Choose a view">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={view === v.id}
                  onClick={() => setView(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sheet__info">
            <div style={{ display: 'grid', gap: 10 }}>
              <p className="eyebrow">{item.marque}</p>
              <h2 className="h2">{item.model}</h2>
              <p className="lede" style={{ fontSize: '0.95rem' }}>
                {item.blurb}
              </p>
            </div>

            <dl className="speclist">
              <div>
                <dt>Marque</dt>
                <dd>{item.marque}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>{item.model}</dd>
              </div>
              <div>
                <dt>Shell</dt>
                <dd>{item.shellLabel}</dd>
              </div>
              <div>
                <dt>Artwork</dt>
                <dd>{item.caption}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{formatPrice()}</dd>
              </div>
            </dl>

            <div style={{ display: 'grid', gap: 12 }}>
              <p className="eyebrow">On the case</p>
              <ul className="printed">
                {item.printed.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <a href="#contact" className="btn btn--primary" onClick={onClose}>
              Ask about this case
            </a>

            <p className="footer__note" style={{ margin: 0 }}>
              {NOTES[view]}
              {site.contact.city ? ` Shipping from ${site.contact.city}.` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
