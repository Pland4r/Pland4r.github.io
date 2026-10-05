'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { getCopy, type Locale } from '@/data/i18n';
import { site } from '@/data/site';

type Props = {
  locale: Locale;
  value: string;
  onChange: (model: string) => void;
};

/**
 * Which iPhone, as a glass list.
 *
 * A native `<select>` cannot be given this surface — the browser draws its own
 * menu and ignores the page's styling entirely — so this is a listbox built by
 * hand. That buys the look and costs the keyboard behaviour a native control
 * has for free, which is why the arrow keys, Home/End, Escape and the
 * roving `aria-activedescendant` are all written out below.
 *
 * On a phone it opens as a sheet off the bottom edge rather than a popover:
 * a floating menu anchored to a control near the foot of the screen ends up
 * under the thumb that opened it.
 */
export default function PhoneSelect({ locale, value, onChange }: Props) {
  const copy = getCopy(locale);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();

  const models = site.models;

  const close = useCallback(() => setOpen(false), []);

  const choose = useCallback(
    (model: string) => {
      onChange(model);
      setOpen(false);
    },
    [onChange],
  );

  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, models.indexOf(value)));

    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, models, value]);

  // Keep the highlighted row in view when the arrows walk past the edge.
  useEffect(() => {
    if (!open) return;
    list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => Math.min(models.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(models.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(models[active]);
        break;
    }
  };

  return (
    <div className={`phonesel ${open ? 'is-open' : ''}`} ref={root}>
      <button
        type="button"
        className="phonesel__trigger"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKey}
        role="combobox"
        // A combobox takes its name from a label, not from the text inside it,
        // so without this the control announces as an unnamed button.
        aria-label={copy.order.yourPhone}
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
      >
        <span className="phonesel__label">{copy.order.yourPhone}</span>
        <span className={`phonesel__value ${value ? '' : 'is-empty'}`} dir="ltr">
          {value || copy.order.pickPhone}
        </span>
        <svg
          className="phonesel__chev"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 4.5 6 7.5 9 4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? <div className="phonesel__scrim" onClick={close} aria-hidden="true" /> : null}

      <ul
        className="phonesel__list"
        id={`${id}-list`}
        ref={list}
        role="listbox"
        aria-label={copy.order.yourPhone}
        hidden={!open}
        onKeyDown={onKey}
      >
        {models.map((m, i) => (
          <li
            key={m}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={m === value}
            className={`phonesel__opt ${i === active ? 'is-active' : ''} ${
              m === value ? 'is-on' : ''
            }`}
            onClick={() => choose(m)}
            onMouseEnter={() => setActive(i)}
            dir="ltr"
          >
            {m}
            {m === value ? (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path
                  d="M2.5 7 5 9.5 10.5 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
