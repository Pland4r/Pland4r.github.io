# MA Cases

A light, Apple-style catalogue site for automotive phone cases, built with
Next.js, with a light and a dark theme. Every case gets three views — a product
video, an interactive 3D turn, and the original unedited photograph.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

## Publishing it

```bash
npm run build
```

That produces a plain `out/` folder of static files. Upload it to Vercel,
Netlify, GitHub Pages, or any normal web host — no server or database needed.

## The things to fill in

Everything a non-developer needs to change is in **`data/site.ts`**:

1. **Price.** It is `null` right now, so the whole site says *“Price on request.”*
   Set `price: 149` (or whatever you charge) and every card and product page
   updates at once. The currency is already `DH`.

2. **Contact details.** Fill in any of `whatsapp`, `instagram`, `email`,
   `phone`, `city`. Buttons appear in the contact section automatically for
   whichever ones you fill in — leave the rest blank.

   `whatsapp` is digits only with the country code, e.g. `212600000000`.

3. **Phone models.** `models` is an empty list, so the Fit section shows a
   simple “tell us your phone” flow instead of promising handsets you may not
   stock. Add them (e.g. `['iPhone 15', 'iPhone 15 Pro']`) and it turns into a
   list.

4. **Delivery.** `delivery` drives the Delivery section and two FAQ answers.
   Add `cities` and it names them; leave it empty and it says “anywhere in
   Morocco”. Set `time` (e.g. `'24–72h'`), `fee` and `freeOver` and those lines
   appear — leave them and nothing is promised. `cashOnDelivery` is on.

## Themes

Light and dark, switched by the toggle in the header. The choice is stored in
`localStorage`; with no choice made, the visitor's system setting wins. An
inline script in `app/layout.tsx` applies it before first paint, so there is no
flash of the wrong theme.

Both palettes are the two `:root` blocks at the top of `app/globals.css`.

The product clips are rendered **twice** — on a light stage and a dark one —
because a white-background clip inside a dark page reads as a bug. Components
pick the matching set through `components/useTheme.ts`. Only the active theme's
video is ever downloaded.

## Adding a new case

1. Drop the photo into `pic/`.
2. Add a row to `MAP` in `scripts/assets.py` mapping the filename to a slug.
3. Add a matching entry to `cases` in `data/cases.ts`.
4. Run `npm run assets`.

## Regenerating the images and videos

```bash
npm run assets           # everything
npm run assets:images    # stills only — fast
npm run assets:video     # clips + hero banner — slow, a few minutes
```

Requires Python with `pillow numpy scipy`, and `ffmpeg` on your PATH:

```bash
python -m pip install pillow numpy scipy
```

### What the pipeline does

`scripts/assets.py` takes each raw photo and produces:

| Output | What it is |
| --- | --- |
| `public/cases/<slug>.png` / `.webp` | the case lifted off its white studio background |
| `public/cases/<slug>-md.webp` | the card-sized still |
| `public/cases/photo/<slug>.webp` | **the original photo, untouched** |
| `public/video/<slug>.mp4` | a 6-second looping product clip + poster |
| `public/video/hero.mp4` | the show-reel band loop + poster |
| `public/video/dark/…` | the same clips rendered on a dark stage |

The cut-out only removes background that is connected to the edge of the frame,
which is why the white cases survive it intact. **The printed artwork is never
edited, recoloured or retouched** — the videos are the real photo lit on a
studio background, and the “Real photo” tab on every product shows the untouched
original so a customer can always check.

### About the 3D view

It is the cut-out photo (`public/cases/<slug>.webp`, full resolution) under a
CSS `rotateY`, following the pointer out to 34 degrees each way and settling
back when the pointer leaves. Nothing is pre-rendered, so it stays sharp at any
size and cannot drift out of sync with the artwork.

`components/TiltView.tsx` is the whole thing. `MAX_DEG` sets how far it turns.

## On phones

Audited at 375 / 390 / 412 / 430 / 768 with touch emulation: no horizontal
scroll at any width, nothing wider than the viewport, no text under 11px, and
tap targets at 44px or more.

Two things phones get that desktop does not:

- **A menu.** Below 720px the section links move into a panel behind a burger.
  It locks the page behind it, closes on Escape, on a link tap, on a tap
  outside, and on rotation past the breakpoint. The panel is near-solid rather
  than glass, because `backdrop-filter` is missing on some Android browsers and
  a see-through menu over the hero is unreadable.
- **Bigger touch targets**, under `@media (pointer: coarse)` so the desktop
  layout keeps its tighter rhythm.

The grid clips play on hover, which phones do not have — tapping a case opens
the sheet and the clip autoplays there. That is deliberate: auto-playing six
videos in the grid would spend a lot of someone's mobile data before they have
asked for anything.

## The logo

`scripts/brand.py` lifts the **MA emblem** out of the generated artwork, drops
the wordmark under it, strips the glow, and **repaints it in the site palette**.

The artwork arrives on black with a heavy bloom that cannot be un-composited
away — the glow is part of the image, so dividing it out just turns the halo
solid. Each ink is separated by hue instead and thresholded on its own channel,
measured at 235 for the whites, where the letters, arch, zellige panel and car
silhouette all resolve and the glow does not.

The mark is then reduced to two regions — letters/zellige/car, and arch/star —
and painted from `PALETTE` at the top of the script, which mirrors the `:root`
blocks in `app/globals.css`:

| | ink | accent (arch + star) |
| --- | --- | --- |
| light | `#1d1d1f` | `#0071e3` |
| dark | `#f5f5f7` | `#2997ff` |

Change those two rows and the logo follows the site. It writes:

| Output | Used for |
| --- | --- |
| `public/brand/ma-mark-on-dark.png` | shown on dark surfaces |
| `public/brand/ma-mark-on-light.png` | shown on light surfaces |
| `app/icon.png` | the favicon, mark on a dark tile |

Two files rather than a CSS filter, because the accent has to stay accent while
the letters flip, and one filter cannot do both. `components/Logo.tsx` renders
the pair and CSS hides one, so it stays a server component with no flash on
load.

Re-run with `python scripts/brand.py`. Replacing the logo by hand means dropping
two PNGs into `public/brand/` under those names.

## The glass and water effects

- **Liquid glass** — cards, feature tiles and the CTA are translucent with a
  `backdrop-filter` blur and a lit rim. Glass only reads as glass when there is
  something behind it to refract, so the collection sits on `.glassfield`, a
  slow-moving colour field, and the cards frost it.
- **Drips** — `components/Drips.tsx` puts seven beads of condensation on each
  card, each clinging and slipping down on its own timing. They speed up on
  hover. Positions come from an integer hash of the index, never `Math.random`
  or `Math.sin`, so the server and browser render byte-identical markup.
- **Hero tap** — clicking the hero case sends a ripple out from the exact point
  you hit, spins the case once, then opens its detail sheet. The sheet belongs
  to `<Collection>`, so the request travels as a `macases:open` DOM event
  rather than lifting that state into a context for one interaction.

All three are disabled under `prefers-reduced-motion`.

## Layout

```
app/          layout, page, global stylesheet, favicon
components/   Nav, ThemeToggle, ScrollProgress, Hero, ShowReel, Ticker,
              Collection, CaseCard, CaseSheet, TiltView, Craft, Fit,
              Delivery, Faq, Contact, Footer, BackToTop, useTheme
data/         site.ts (settings)  ·  cases.ts (the collection)
scripts/      assets.py (image and video pipeline)
pic/          the original source photos
public/       generated images and video
```

Both palettes live in the `:root` blocks at the top of `app/globals.css` —
change `--bg`, `--fg` and `--accent` there and the entire site follows.
