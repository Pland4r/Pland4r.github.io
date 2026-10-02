import { cases } from '@/data/cases';
import { getCopy, type Locale } from '@/data/i18n';
import { site } from '@/data/site';
import Reveal from './Reveal';

export default function Fit({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const hasModels = site.models.length > 0;

  return (
    <section className="section" id="fit">
      <div className="gridlines" aria-hidden="true" />
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">{copy.fit.eyebrow}</p>
            <h2 className="h1">{copy.fit.heading}</h2>
            <p className="lede">{copy.fit.lede}</p>
          </Reveal>
        </div>

        {hasModels ? (
          <Reveal>
            <div className="feats">
              {site.models.map((m) => (
                <article className="feat" key={m}>
                  <h3>{m}</h3>
                </article>
              ))}
            </div>
          </Reveal>
        ) : (
          <Reveal>
            <div className="feats">
              {copy.fit.steps.map((step, i) => (
                <article className="feat" key={step.title}>
                  <p className="feat__n mono">
                    {copy.fit.step} {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3>{step.title}</h3>
                  <p>{step.body(cases.length)}</p>
                </article>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
