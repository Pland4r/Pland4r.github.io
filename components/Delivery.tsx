import { getCopy, type Locale } from '@/data/i18n';
import { site } from '@/data/site';
import Reveal from './Reveal';

/**
 * Every line here is driven by `site.delivery`. Anything left unset is simply
 * not shown, so the page never promises a delivery time or a fee that has not
 * been decided.
 */
export default function Delivery({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const d = site.delivery;
  const country = copy.countryName(d.country);
  const named = d.cities.length > 0;

  const points: { key: string; label: string; title: string; body: string }[] = [
    {
      key: 'where',
      label: copy.delivery.where,
      title: named ? d.cities.slice(0, 3).join(' · ') : copy.delivery.allOf(country),
      body: named
        ? copy.delivery.weDeliverTo(d.cities.join(', '), country)
        : copy.delivery.shipAnywhere(country),
    },
  ];

  if (d.cashOnDelivery) {
    points.push({
      key: 'payment',
      label: copy.delivery.payment,
      title: copy.delivery.cashOnDelivery,
      body: copy.delivery.cashOnDeliveryBody,
    });
  }

  if (d.time) {
    points.push({
      key: 'time',
      label: copy.delivery.howLong,
      title: d.time,
      body: copy.delivery.howLongBody,
    });
  }

  if (d.fee !== null) {
    points.push({
      key: 'fee',
      label: copy.delivery.shipping,
      title: `${d.fee} ${site.currency}`,
      body:
        d.freeOver !== null
          ? copy.delivery.flatRateFreeOver(country, `${d.freeOver} ${site.currency}`)
          : copy.delivery.flatRate(country),
    });
  }

  return (
    <section className="section" id="delivery">
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">{copy.delivery.eyebrow}</p>
            <h2 className="h1">{copy.delivery.heading(country)}</h2>
            <p className="lede">{copy.delivery.lede}</p>
          </Reveal>
        </div>

        <div className="feats">
          {points.map((p, i) => (
            <Reveal key={p.key} delay={i * 80}>
              <article className="feat">
                <p className="feat__n mono">{p.label.toUpperCase()}</p>
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
