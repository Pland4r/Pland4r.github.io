'use client';

import { useEffect, useState } from 'react';
import OrderForm from './OrderForm';
import PhoneSelect from './PhoneSelect';
import type { Case } from '@/data/cases';
import { getCopy, type Locale } from '@/data/i18n';
import { enquiryLink, formatPrice, site } from '@/data/site';
import { rev } from '@/data/rev';
import TiltView from './TiltView';
import { useTheme } from './useTheme';

type Props = {
  item: Case;
  locale: Locale;
  /** Where "Ask about this case" goes — '#contact' in the sheet, '/#contact' on its own page. */
  askHref: string;
  /** The sheet passes its close here, so asking a question does not leave the dialog open behind. */
  onAsk?: () => void;
};

type View = 'motion' | 'tilt' | 'photo';

const VIEWS: View[] = ['motion', 'tilt', 'photo'];

/**
 * The three views and the spec column — everything about a case that is not
 * the dialog around it.
 *
 * It is shared rather than duplicated because a case now has two homes: the
 * sheet that opens over the collection, and its own page at /<slug>/. The two
 * must not be able to drift apart, since the page is the one a customer gets
 * sent and the sheet is the one they browse.
 */
export default function CaseDetail({ item, locale, askHref, onAsk }: Props) {
  const copy = getCopy(locale);
  const [view, setView] = useState<View>('motion');
  const { theme } = useTheme();
  const clipDir = theme === 'dark' ? '/video/dark' : '/video';
  const order = enquiryLink(copy, item);
  const [ordering, setOrdering] = useState(false);
  const [model, setModel] = useState('');

  // Reset to the motion view whenever a different case is shown.
  useEffect(() => setView('motion'), [item.slug]);

  return (
    <div className="sheet__grid">
      <div>
        <div className={`sheet__media ${view === 'tilt' ? 'sheet__media--bare' : ''}`}>
          {view === 'motion' ? (
            <video
              key={`${item.slug}-${theme}`}
              src={`${clipDir}/${item.slug}.mp4${rev(item.slug)}`}
              poster={`${clipDir}/${item.slug}-poster.webp${rev(item.slug)}`}
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
              src={`/cases/photo/${item.slug}.webp${rev(item.slug)}`}
              alt={copy.sheet.photoAlt(item.marque, item.model)}
            />
          )}
        </div>

        <div className="viewtabs" role="group" aria-label={copy.sheet.chooseView}>
          {VIEWS.map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
              {copy.sheet[v]}
            </button>
          ))}
        </div>
      </div>

      <div className="sheet__info">
        <div style={{ display: 'grid', gap: 10 }}>
          <p className="eyebrow">{item.marque}</p>
          <h2 className="h2">{item.model}</h2>
          {item.blurb ? (
            <p className="lede" style={{ fontSize: '0.95rem' }} dir="auto">
              {item.blurb}
            </p>
          ) : null}
        </div>

        <dl className="speclist">
          <div>
            <dt>{copy.sheet.marque}</dt>
            <dd dir="auto">{item.marque}</dd>
          </div>
          <div>
            <dt>{copy.sheet.model}</dt>
            <dd dir="auto">{item.model}</dd>
          </div>
          <div>
            <dt>{copy.sheet.shell}</dt>
            <dd dir="auto">{item.shellLabel}</dd>
          </div>
          {item.caption ? (
            <div>
              <dt>{copy.sheet.artwork}</dt>
              <dd dir="auto">{item.caption}</dd>
            </div>
          ) : null}
          <div>
            <dt>{copy.sheet.price}</dt>
            <dd>{formatPrice(copy)}</dd>
          </div>
        </dl>

        {item.printed && item.printed.length > 0 ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <p className="eyebrow">{copy.sheet.onTheCase}</p>
            <ul className="printed">
              {item.printed.map((line) => (
                <li key={line} dir="auto">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* With a number set this opens WhatsApp with the case and its link
            already written; without one it falls back to the contact section,
            which says the order line is still being set up. */}
        {/* Which iPhone is the one question that decides whether this case
            exists for you, so it is asked here rather than inside the form —
            and carried across when the form opens. With no number and no
            endpoint set the page falls back to the contact section, so it never
            offers something it cannot deliver. */}
        {site.contact.whatsapp || site.orderEndpoint ? (
          <>
            <PhoneSelect locale={locale} value={model} onChange={setModel} />
            <button type="button" className="btn btn--primary" onClick={() => setOrdering(true)}>
              {copy.order.cta}
            </button>
          </>
        ) : (
          <a href={askHref} className="btn btn--primary" onClick={onAsk}>
            {copy.sheet.ask}
          </a>
        )}

        {order ? (
          <a href={order} className="btn btn--ghost btn--sm" target="_blank" rel="noopener noreferrer">
            {copy.sheet.order}
          </a>
        ) : null}

        {ordering ? (
          <OrderForm
            item={item}
            locale={locale}
            chosen={model}
            onClose={() => setOrdering(false)}
          />
        ) : null}

        <p className="footer__note" style={{ margin: 0 }}>
          {view === 'motion' ? copy.sheet.noteMotion : view === 'tilt' ? copy.sheet.noteTilt : copy.sheet.notePhoto}
          {site.contact.city ? copy.sheet.shipsFrom(site.contact.city) : ''}
        </p>
      </div>
    </div>
  );
}
