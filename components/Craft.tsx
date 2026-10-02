import { getCopy, type Locale } from '@/data/i18n';
import Reveal from './Reveal';

/**
 * Every claim in `copy.craft.features` is something you can see in the product
 * photographs on this site — a raised camera lip, moulded button covers, a
 * two-part shell, print that runs to the edge. Nothing there invents a drop
 * rating or a material spec. If you want to add those, add them once you can
 * stand behind them, in all three languages.
 */

export default function Craft({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  return (
    <section className="section section--tint" id="craft">
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">{copy.craft.eyebrow}</p>
            <h2 className="h1">{copy.craft.heading}</h2>
            <p className="lede">{copy.craft.lede}</p>
          </Reveal>
        </div>

        <div className="feats">
          {copy.craft.features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <article className="feat">
                <p className="feat__n mono">{String(i + 1).padStart(2, '0')}</p>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
