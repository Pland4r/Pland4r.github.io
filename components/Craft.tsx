import Reveal from './Reveal';

/**
 * Every claim below is something you can see in the product photographs on this
 * site — a raised camera lip, moulded button covers, a two-part shell, print
 * that runs to the edge. Nothing here invents a drop rating or a material spec.
 * If you want to add those, add them here once you can stand behind them.
 */
const features = [
  {
    n: '01',
    title: 'Two-part shell',
    body:
      'A rigid printed back with a flexible frame wrapped around it. You can see the ' +
      'seam and the moulded side sections in every photo on this page.',
  },
  {
    n: '02',
    title: 'Raised camera lip',
    body:
      'The camera opening sits proud of the lenses, so the glass is not what meets ' +
      'the table when you put the phone down.',
  },
  {
    n: '03',
    title: 'Covered buttons',
    body:
      'Volume and power are covered by moulded buttons rather than left as open ' +
      'cut-outs — visible along the left and right edges of each case.',
  },
  {
    n: '04',
    title: 'Print to the edge',
    body:
      'Artwork runs the full height of the back and around the curve, so the design ' +
      'does not stop short with a border.',
  },
];

export default function Craft() {
  return (
    <section className="section section--tint" id="craft">
      <div className="wrap">
        <div className="sec-head">
          <Reveal className="sec-head__text">
            <p className="eyebrow">Made</p>
            <h2 className="h1">What you are actually holding.</h2>
            <p className="lede">
              No renders, no borrowed studio shots. Each case here was photographed as
              it ships, and the details below are the ones you can see in those photos.
            </p>
          </Reveal>
        </div>

        <div className="feats">
          {features.map((f, i) => (
            <Reveal key={f.n} delay={i * 80}>
              <article className="feat">
                <p className="feat__n mono">{f.n}</p>
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
