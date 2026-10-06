import { path, type Copy } from './i18n';

/* ---------------------------------------------------------------------------
   MA Cases — site-wide settings.
   Everything a non-developer needs to change lives in this one file.
   --------------------------------------------------------------------------- */

export const site = {
  name: 'MA Cases',
  /** Shown under the logo and in the browser tab. */
  tagline: 'Automotive phone cases',
  description:
    'A curated collection of automotive-art phone cases. Real product photography, no renders.',

  /**
   * Where the site actually lives. Used for the canonical link, the sitemap,
   * and the picture a shared link shows — those have to be absolute URLs, so
   * a wrong value here means link previews point at the wrong host.
   *
   * No trailing slash.
   */
  url: 'https://ma-cases.pages.dev',

  /** Currency shown next to every price. */
  currency: 'DH',

  /**
   * Catalogue price for a single case, in MAD.
   * Leave as `null` and the site shows “Price on request” everywhere —
   * nothing invented is ever shown to a customer.
   * Set it to a number (e.g. `PRICE = 149`) and every card updates at once.
   */
  price: 130 as number | null,

  /**
   * The handsets you can supply, newest first — the order form shows them in
   * this order and the Fit section lists them.
   *
   * Delete any you do not stock. Nothing here is a promise the shop cannot
   * keep: a model that is not on this list cannot be picked.
   */
  models: [
    'iPhone 18 Pro Max',
    'iPhone 18 Pro',
    'iPhone Air (2026)',
    'iPhone 17 Pro Max',
    'iPhone 17 Pro',
    'iPhone 17',
    'iPhone Air',
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 16 Plus',
    'iPhone 16',
    'iPhone 16e',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 15 Plus',
    'iPhone 15',
    'iPhone 14 Pro Max',
    'iPhone 14 Pro',
    'iPhone 14 Plus',
    'iPhone 14',
    'iPhone 13 Pro Max',
    'iPhone 13 Pro',
    'iPhone 13',
    'iPhone 13 mini',
    'iPhone 12 Pro Max',
    'iPhone 12 Pro',
    'iPhone 12',
    'iPhone 12 mini',
    'iPhone 11 Pro Max',
    'iPhone 11 Pro',
    'iPhone 11',
    'iPhone XS Max',
    'iPhone XS',
    'iPhone XR',
    'iPhone X',
  ] as string[],

  /**
   * Where the order form posts.
   *
   * Empty means the form still works: it collects everything and hands the
   * finished order to WhatsApp instead, so nothing is lost while this is being
   * set up. ORDERS.md has the five-minute Google Sheet setup — free, no
   * monthly limit, never asks for a card.
   */
  orderEndpoint:
    'https://script.google.com/macros/s/AKfycbxzOy61WqlvFMgfWy7bw3LGRyXLTqt38HgIuSa1u60LSCpS4WCybORjMJWVNB3nAof9eQ/exec',

  /**
   * Cloudflare Web Analytics token, from the dashboard under Analytics > Web
   * Analytics > your site > Manage site. Empty means no analytics script is
   * loaded at all — not a disabled one, none.
   *
   * That service rather than the usual one because it sets no cookies and
   * stores nothing about a visitor, so the site needs no consent banner.
   */
  analytics: '',

  /** Optional: fill these in and they appear in the contact section + footer. */
  contact: {
    phone: '+212 663 095 465',
    whatsapp: '212663095465',   // digits only, with the country code
    instagram: '',  // handle without the @, e.g. 'macases'
    email: '',      // e.g. 'hello@macases.ma'
    city: '',       // e.g. 'Casablanca'
  },

  /* ------------------------------------------------------------------ Morocco */

  delivery: {
    country: 'Morocco',

    /**
     * Cities you deliver to. Leave empty and the section says “everywhere in
     * Morocco” instead of naming places you may not cover.
     */
    cities: [] as string[],

    /** Set to false if you do not offer cash on delivery. */
    cashOnDelivery: true,

    /** e.g. '24–72h'. Empty hides the line rather than promising a time. */
    time: '',

    /** e.g. 30 for a 30 DH flat rate, or null to leave it out. */
    fee: null as number | null,

    /** e.g. 300 — orders above this ship free. null leaves it out. */
    freeOver: null as number | null,
  },
};

export function formatPrice(copy: Copy): string {
  return site.price === null
    ? copy.sheet.priceOnRequest
    : `${site.price} ${site.currency}`;
}


/**
 * A WhatsApp chat with the message already written.
 *
 * Without this the button opens an empty chat, and an empty chat is where an
 * order goes to die: the customer has to describe which case they meant, so
 * most send "hello" and wait, and you are left asking which one. Pre-filling it
 * means the case and its link arrive with the first message.
 *
 * Returns null when there is no number yet, and the caller falls back to
 * scrolling to the contact section.
 */
export function enquiryLink(
  copy: Copy,
  item?: { marque: string; model: string; slug: string },
): string | null {
  if (!site.contact.whatsapp) return null;

  const text = item
    ? copy.enquiry(`${item.marque} ${item.model}`, `${site.url}${path(copy.locale, item.slug + '/')}`)
    : copy.enquiryGeneral;

  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}
