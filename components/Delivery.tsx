import { site } from '@/data/site';
import Reveal from './Reveal';

/**
 * Every line here is driven by `site.delivery`. Anything left unset is simply
 * not shown, so the page never promises a delivery time or a fee that has not
 * been decided.
 */
export default function Delivery() {
  const d = site.delivery;

  const points: { n: string; title: string; body: string }[] = [
    {
      n: 'Where',
      title: d.cities.length > 0 ? d.cities.slice(0, 3).join(' · ') : `All of ${d.country}`,
      body:
        d.cities.length > 0
          ? `We deliver to ${d.cities.join(', ')}. Somewhere else in ${d.country}? Ask us.`
          : `We ship anywhere in ${d.country}. Tell us your city and we will confirm.`,
    },
  ];

  if (d.cashOnDelivery) {
    points.push({
      n: 'Payment',
      title: 'Cash on delivery',
      body: 'Pay the courier when the case reaches you. Nothing up front, no card needed.',
    });
  }

  if (d.time) {
    points.push({
      n: 'How long',
      title: d.time,
      body: `Typical delivery time once your order is confirmed.`,
    });
  }

  if (d.fee !== null) {
    points.push({
      n: 'Shipping',
      title: `${d.fee} ${site.currency}`,
      body:
        d.freeOver !== null
          ? `Flat rate anywhere in ${d.country}. Free over ${d.freeOver} ${site.currency}.`
          : `Flat rate anywhere in ${d.country}.`,
    });
  }

  return (
    <section className="section" id="delivery">
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">Delivery</p>
            <h2 className="h1">
              Anywhere in {d.country}.
            </h2>
            <p className="lede">
              Message us with the case and your phone model. We confirm availability
              and price first — you only commit once you know both.
            </p>
          </Reveal>
        </div>

        <div className="feats">
          {points.map((p, i) => (
            <Reveal key={p.n} delay={i * 80}>
              <article className="feat">
                <p className="feat__n mono">{p.n.toUpperCase()}</p>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
