'use client';

import { useEffect, useRef, useState } from 'react';
import type { Case } from '@/data/cases';
import { getCopy, type Locale } from '@/data/i18n';
import { site } from '@/data/site';
import { Close } from './Icons';

type Props = { item: Case; locale: Locale; onClose: () => void };

type State = 'filling' | 'sending' | 'sent' | 'failed';

/**
 * The order form.
 *
 * The site is a static export, so there is nothing of ours running to receive
 * this — it posts to whatever `site.orderEndpoint` names. With that unset the
 * form still works: it hands the finished order to WhatsApp instead, so the
 * shop can take orders from the day it opens and the sheet can be set up
 * whenever. Nothing a customer types is ever lost to a missing config.
 *
 * `no-cors` on the POST because a Google Apps Script endpoint does not send
 * CORS headers back. That makes the response opaque — we cannot read a status —
 * so a submission that reaches the script and fails there looks the same as one
 * that succeeded. The confirmation screen says we will come back to confirm,
 * which is true either way, and the WhatsApp route stays one tap away.
 */
export default function OrderForm({ item, locale, onClose }: Props) {
  const copy = getCopy(locale);
  const [model, setModel] = useState('');
  const [state, setState] = useState<State>('filling');
  // Built at submit time and kept, because by the time the failure screen
  // renders the form is gone and there is nothing left to read the fields from.
  const [fallback, setFallback] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const restoreTo = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.classList.add('is-locked');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      restoreTo?.focus?.();
    };
  }, [onClose]);

  const values = () => {
    const d = new FormData(form.current as HTMLFormElement);
    const get = (k: string) => String(d.get(k) ?? '').trim();
    return {
      case: `${item.marque} ${item.model}`,
      model,
      name: get('name'),
      phone: get('phone'),
      city: get('city'),
      address: get('address'),
      notes: get('notes'),
      link: `${site.url}/${locale === 'en' ? '' : locale + '/'}${item.slug}/`,
    };
  };

  const whatsapp = (order: ReturnType<typeof values>) =>
    site.contact.whatsapp
      ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(copy.order.message(order))}`
      : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!model) return;

    const order = values();

    const link = whatsapp(order);
    setFallback(link);

    // No endpoint yet: hand the finished order to WhatsApp rather than drop it.
    if (!site.orderEndpoint) {
      if (link) window.open(link, '_blank', 'noopener');
      setState('sent');
      return;
    }

    setState('sending');
    try {
      await fetch(site.orderEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...order, slug: item.slug, locale, at: new Date().toISOString() }),
      });
      setState('sent');
    } catch {
      setState('failed');
    }
  };

  const done = state === 'sent' || state === 'failed';

  return (
    <div
      className="sheet order"
      role="dialog"
      aria-modal="true"
      aria-label={copy.order.title}
      style={{ '--sheet-accent': item.accent } as React.CSSProperties}
    >
      <div className="sheet__scrim" onClick={onClose} />

      <div className="sheet__panel order__panel" ref={panelRef}>
        <button
          ref={closeRef}
          type="button"
          className="sheet__close"
          onClick={onClose}
          aria-label={copy.order.close}
        >
          <Close />
        </button>

        {done ? (
          <div className="order__done">
            <p className="eyebrow">{item.marque}</p>
            <h2 className="h2">
              {state === 'sent' ? copy.order.sentTitle : copy.order.failTitle}
            </h2>
            <p className="lede">
              {state === 'sent' ? copy.order.sentBody : copy.order.failBody}
            </p>
            {state === 'failed' && fallback ? (
              <a href={fallback} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                {copy.order.viaWhatsapp}
              </a>
            ) : (
              <button type="button" className="btn btn--primary" onClick={onClose}>
                {copy.order.close}
              </button>
            )}
          </div>
        ) : (
          <form ref={form} className="order__form" onSubmit={submit}>
            <div className="order__head">
              <p className="eyebrow">{item.marque}</p>
              <h2 className="h2">{copy.order.title}</h2>
              <p className="lede">{copy.order.lede}</p>
            </div>

            <fieldset className="order__phones">
              <legend>
                {copy.order.yourPhone}
                <span className="order__hint">{copy.order.pickPhone}</span>
              </legend>

              <div className="phonegrid" role="radiogroup" aria-label={copy.order.yourPhone}>
                {site.models.map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={model === m}
                    className={`phonecard ${model === m ? 'is-on' : ''}`}
                    onClick={() => setModel(m)}
                    // A model name is Latin either way: without this, Arabic
                    // reverses it and "18 Pro Max" reads "Pro Max 18".
                    dir="ltr"
                  >
                    {m.replace(/^iPhone /, '')}
                  </button>
                ))}
              </div>
              {touched && !model ? (
                <p className="order__error" role="alert">{copy.order.noPhone}</p>
              ) : null}
            </fieldset>

            <div className="order__fields">
              <label>
                <span>{copy.order.name}</span>
                <input name="name" required autoComplete="name" placeholder={copy.order.namePh} />
              </label>
              <label>
                <span>{copy.order.phone}</span>
                <input
                  name="phone"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={copy.order.phonePh}
                />
              </label>
              <label>
                <span>{copy.order.city}</span>
                <input
                  name="city"
                  required
                  autoComplete="address-level2"
                  placeholder={copy.order.cityPh}
                />
              </label>
              <label className="order__wide">
                <span>{copy.order.address}</span>
                <input
                  name="address"
                  required
                  autoComplete="street-address"
                  placeholder={copy.order.addressPh}
                />
              </label>
              <label className="order__wide">
                <span>
                  {copy.order.notes} <em>{copy.order.optional}</em>
                </span>
                <textarea name="notes" rows={2} placeholder={copy.order.notesPh} />
              </label>
            </div>

            <button type="submit" className="btn btn--primary" disabled={state === 'sending'}>
              {state === 'sending' ? copy.order.sending : copy.order.send}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
