'use client';

import { useEffect, useRef } from 'react';
import type { Case } from '@/data/cases';
import { getCopy, type Locale } from '@/data/i18n';
import CaseDetail from './CaseDetail';
import { Close } from './Icons';

type Props = {
  item: Case;
  onClose: () => void;
  locale: Locale;
};

/**
 * A case opened over the collection.
 *
 * Only the dialog lives here — the scrim, the close button, the focus trap and
 * the body lock. What is inside it is `CaseDetail`, which the case's own page
 * at /<slug>/ renders too, so browsing and being sent a link show the same
 * thing.
 */
export default function CaseSheet({ item, onClose, locale }: Props) {
  const copy = getCopy(locale);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
        <button ref={closeRef} type="button" className="sheet__close" onClick={onClose} aria-label={copy.sheet.close}>
          <Close />
        </button>

        <CaseDetail item={item} locale={locale} askHref="#contact" onAsk={onClose} />
      </div>
    </div>
  );
}
