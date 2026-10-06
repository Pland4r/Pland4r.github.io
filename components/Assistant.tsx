'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { collection } from '@/data/cases';
import { INTENTS, facts, route } from '@/data/assistant';
import { getCopy, type Locale } from '@/data/i18n';
import { path } from '@/data/i18n';
import { enquiryLink, site } from '@/data/site';
import { Close } from './Icons';

type Line = { from: 'them' | 'us'; text: string };

/**
 * The question answerer.
 *
 * Scripted, not a language model: it matches what someone types against a
 * keyword list in `data/assistant.ts` and replies with an answer a person
 * wrote. That is deliberate — a shop that will not invent a delivery time in
 * its own copy should not have a bot inventing one in a chat, and this one
 * cannot, because it has nothing to invent with.
 *
 * What it does not recognise, it hands to WhatsApp rather than guessing at.
 */
export default function Assistant({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [asked, setAsked] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const cases = collection(locale);
  const f = facts(cases.length, Array.from(new Set(cases.map((c) => c.marque))));
  const human = enquiryLink(copy);

  useEffect(() => {
    if (!open) return;
    if (lines.length === 0) setLines([{ from: 'them', text: copy.assistant.greeting }]);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, lines.length, copy.assistant.greeting]);

  // Keep the newest reply in view without yanking the whole page around.
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const reply = useCallback(
    async (question: string) => {
      setLines((l) => [...l, { from: 'us', text: question }]);

      const hit = route(question, locale);
      const written = hit ? hit.answer[locale](f) : copy.assistant.unknown;
      if (hit) setAsked((a) => (a.includes(hit.id) ? a : [...a, hit.id]));

      // The model answers, because it can follow a question that is not one of
      // the nine written ones. The written answer stays as the net: if the
      // Worker is down or slow to fail, the customer still gets the right reply
      // rather than an error, and the shop still says the same thing.
      if (!site.assistantEndpoint) {
        setLines((l) => [...l, { from: 'them', text: written }]);
        return;
      }

      setThinking(true);
      try {
        const res = await fetch(site.assistantEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            facts: f,
            // The whole catalogue, so it can answer "which colours" or "what is
            // on the Chiron" instead of refusing. It is built from the same
            // data the page renders, so the two cannot drift apart.
            cases: cases.map((c) => ({
              marque: c.marque,
              model: c.model,
              caption: c.caption,
              shell: c.shellLabel,
              printed: c.printed ?? [],
              link: `${site.url}${path(locale, `${c.slug}/`)}`,
            })),
            messages: [
              ...lines.map((l) => ({
                role: l.from === 'us' ? 'user' : 'assistant',
                content: l.text,
              })),
              { role: 'user', content: question },
            ],
          }),
        });
        const data = await res.json();
        setLines((l) => [...l, { from: 'them', text: data?.reply || written }]);
      } catch {
        // A model that is down must not take the shop down with it.
        setLines((l) => [...l, { from: 'them', text: written }]);
      } finally {
        setThinking(false);
      }
    },
    [locale, f, cases, lines, copy.assistant.unknown],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q) return;
    setDraft('');
    reply(q);
    input.current?.focus();
  };

  // Chips already answered drop off, so the list shrinks as it is used.
  const chips = INTENTS.filter((i) => !asked.includes(i.id)).slice(0, 4);

  if (!site.contact.whatsapp && !site.orderEndpoint) return null;

  return (
    <>
      <button
        type="button"
        className={`ask ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={copy.assistant.open}
      >
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
          <path
            d="M8.5 15.5c3.87 0 7-2.8 7-6.25S12.37 3 8.5 3 1.5 5.8 1.5 9.25c0 1.46.56 2.8 1.5 3.86L2.3 15.5l3.1-.78c.95.5 2 .78 3.1.78Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        <span>{copy.assistant.open}</span>
      </button>

      {open ? (
        <div className="askpanel" role="dialog" aria-label={copy.assistant.title}>
          <header className="askpanel__head">
            <div>
              <h2>{copy.assistant.title}</h2>
              <p>{copy.assistant.subtitle}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={copy.assistant.close}>
              <Close />
            </button>
          </header>

          <div className="askpanel__log" ref={log} aria-live="polite">
            {lines.map((l, i) => (
              <p key={i} className={`askline askline--${l.from}`}>
                {l.text}
              </p>
            ))}
            {thinking ? (
              <p className="askline askline--them askline--wait" aria-label={copy.assistant.send}>
                <span /><span /><span />
              </p>
            ) : null}
          </div>

          {chips.length ? (
            <div className="askpanel__chips">
              {chips.map((i) => (
                <button key={i.id} type="button" onClick={() => reply(i.ask[locale])}>
                  {i.ask[locale]}
                </button>
              ))}
            </div>
          ) : null}

          <form className="askpanel__foot" onSubmit={submit}>
            <input
              ref={input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={copy.assistant.placeholder}
              aria-label={copy.assistant.placeholder}
            />
            <button
              type="submit"
              aria-label={copy.assistant.send}
              disabled={!draft.trim() || thinking}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path
                  d="M2 7.5h10M8 3.5l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          <p className="askpanel__note">
            {copy.assistant.disclaimer}
            {human ? (
              <>
                {' '}
                <a href={human} target="_blank" rel="noopener noreferrer">
                  {copy.assistant.toHuman}
                </a>
              </>
            ) : null}
          </p>
        </div>
      ) : null}
    </>
  );
}
