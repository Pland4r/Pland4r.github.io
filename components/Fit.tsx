import { site } from '@/data/site';
import Reveal from './Reveal';

export default function Fit() {
  const hasModels = site.models.length > 0;

  return (
    <section className="section" id="fit">
      <div className="gridlines" aria-hidden="true" />
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">Fit</p>
            <h2 className="h1">Cut for your phone, not adapted to it.</h2>
            <p className="lede">
              Each case is made for one specific handset, so the camera surround, the
              buttons and the port line up exactly. Tell us the phone and we will
              confirm the design is available for it.
            </p>
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
              <article className="feat">
                <p className="feat__n mono">STEP 01</p>
                <h3>Pick the design</h3>
                <p>Choose from the six cases in the collection above.</p>
              </article>
              <article className="feat">
                <p className="feat__n mono">STEP 02</p>
                <h3>Send your model</h3>
                <p>
                  Message us with your exact phone model — the print is produced per
                  handset.
                </p>
              </article>
              <article className="feat">
                <p className="feat__n mono">STEP 03</p>
                <h3>We confirm</h3>
                <p>
                  We come back to you with availability and price before anything is
                  made.
                </p>
              </article>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
