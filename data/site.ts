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

  /** Currency shown next to every price. */
  currency: 'DH',

  /**
   * Catalogue price for a single case, in MAD.
   * Leave as `null` and the site shows “Price on request” everywhere —
   * nothing invented is ever shown to a customer.
   * Set it to a number (e.g. `PRICE = 149`) and every card updates at once.
   */
  price: null as number | null,

  /**
   * Phone models you can supply. Leave the array empty and the Fit section
   * simply asks the customer which phone they have, rather than promising
   * models you may not stock.
   */
  models: [] as string[],

  /** Optional: fill these in and they appear in the contact section + footer. */
  contact: {
    phone: '',      // e.g. '+212 6 00 00 00 00'
    whatsapp: '',   // digits only, e.g. '2126000000000'
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

export function formatPrice(): string {
  return site.price === null ? 'Price on request' : `${site.price} ${site.currency}`;
}
