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

3. **Analytics.** `analytics` takes a Cloudflare Web Analytics token
   (dashboard → Analytics → Web Analytics → Manage site). Empty means no
   script is loaded at all, not a disabled one. It is that service because it
   sets no cookies, so the site needs no consent banner.

4. **Phone models.** `models` is an empty list, so the Fit section shows a
   simple “tell us your phone” flow instead of promising handsets you may not
   stock. Add them (e.g. `['iPhone 15', 'iPhone 15 Pro']`) and it turns into a
   list.

5. **Delivery.** `delivery` drives the Delivery section and two FAQ answers.
   Add `cities` and it names them; leave it empty and it says “anywhere in
   Morocco”. Set `time` (e.g. `'24–72h'`), `fee` and `freeOver` and those lines
   appear — leave them and nothing is promised. `cashOnDelivery` is on.

## How an order arrives

There is no checkout. With `contact.whatsapp` set, **Order on WhatsApp** on a
case opens a chat with the message already written:

> Hello! I am interested in the Bugatti Chiron Pur Sport case.
> https://ma-cases.pages.dev/bugatti-chiron-pur-sport/

An empty chat is where an order goes to die — the customer has to describe
which case they meant, so most send “hello” and wait, and you are left asking
which one. The case and its link arriving with the first message is the whole
point. `ENQUIRY` and `ENQUIRY_GENERAL` in `data/site.ts` are the wording, and
they are the first lines to change when the site is translated.

With no number set the button falls back to scrolling to the contact section,
which says the order line is still being set up. Nothing has to be switched on.

## Two ways to reach a case

The collection is one page, and tapping a case opens a sheet over it. That is a
good way to browse and a useless thing to send someone — the address bar never
changes, so *“here is the Chiron”* could only ever be a link to the whole site.

So every case also has its own page:

```
https://ma-cases.pages.dev/bugatti-chiron-pur-sport/
```

Both show the same thing: `components/CaseDetail.tsx` is the three views and
the spec column, and it is shared rather than copied, so the page a customer is
sent and the sheet they browse cannot drift apart. `app/[slug]/page.tsx` writes
one page per case at build time from `cases`, so a new photo gets a page, a
sitemap entry and a link preview without anyone adding it to a list.

The cards in the grid are real `<a>` links to those pages. A plain click is
intercepted and opens the sheet instead, but a ctrl/cmd-click, a middle click
and *Copy link address* all still do what they should — which is the entire
point of them being links.

### What a shared link looks like

`scripts/assets.py` renders **`public/og/<slug>.jpg`**, 1200×630, the case on
the light stage. Paste a case link into WhatsApp or Instagram and that is the
picture that comes up, with the marque and model beside it.

JPEG rather than WebP because the scrapers that read these are unreliable with
WebP, and a preview that silently fails is worse than a plain one. No text
burned into the image — the name travels as `og:title`, and drawing text would
mean shipping a font and hoping it exists on the CI runner.

Set **`url`** in `data/site.ts` to wherever the site actually lives. It is the
one value those previews depend on: it has to be absolute, so a wrong value
points every preview at the wrong host.

`app/sitemap.ts` and `app/robots.ts` are generated from the same list.

## Three languages

| | | |
| --- | --- | --- |
| English | `/` | the default, so it takes no prefix |
| Français | `/fr/` | |
| العربية | `/ar/` | right-to-left |

Every word is in **`data/i18n/`** — `en.ts`, `fr.ts`, `ar.ts`, all three checked
against one shape in `types.ts`. A language missing a line does not compile,
because a half-translated page only looks broken to the person who speaks that
language and not to whoever is checking.

Anything that varies with a number or a name is a function rather than a string
with a hole in it, so word order stays the translator's business. Arabic writes
counts as figures: its numerals agree with the gender of what they count and
invert polarity between three and ten, so spelling them out needs a different
word for cars than for cases, and getting that wrong is more conspicuous than a
figure.

Components take a `locale` and look their own words up. They do not take the
dictionary as a prop — half of them are server components and half are client
ones, and a dictionary full of functions cannot cross that boundary.

### Arabic

`dir="rtl"` goes on a wrapper inside `<body>`, not on `<html>`: only the root
layout renders `<html>` and it is shared by all three languages, so it cannot
know which one is being served. The wrapper is in the served markup, so a reader
with scripting off still gets the right direction; the boot script then mirrors
`lang` and `dir` onto `<html>` before first paint for the scrollbar and the
browser's own controls.

The layout mirrors itself, because the stylesheet uses logical properties —
`text-align: start`, `inset-inline-end` — rather than a second copy of each rule
under `[dir="rtl"]`. What needed saying explicitly is in one block at the foot
of `globals.css`: the theme toggle slides the other way, arrows that mean
"onward" point the other way, and Latin display type stays left-to-right inside
a right-to-left page.

Inter has no Arabic glyphs, so the Arabic pages load Noto Sans Arabic. Without
it they fall back to whatever the device happens to have, which sits at a
different weight and height from the rest of the site.

### Describing a case in three languages

`blurb` and `printed` in `data/overrides.ts` are keyed by language:

```ts
blurb: {
  en: 'BUGATTI in enormous gradient type running off both edges…',
  fr: 'BUGATTI en énormes caractères dégradés qui débordent des deux côtés…',
  ar: 'كلمة BUGATTI بخط متدرّج ضخم يتجاوز الحافتين…',
},
```

Only `en` is required. A language left out **falls back to English** rather than
disappearing, so a case is never silently blank in French or Arabic — it is
visibly still in English, which is the state you want to be able to see.

`caption` is not translated: it quotes what is printed on the case, and the case
does not change language. Those lines, and the spec strips, carry `dir="auto"`
so a run of Latin text inside an Arabic paragraph keeps its own direction
instead of throwing its full stop to the wrong end.

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

**Drop the photo into `pic/` and push. Any filename works.**

In the browser: **github.com → `pic/` → Add file → Upload files → Commit**. Works
from a phone. The deploy workflow then cuts the case off its studio background,
writes the card still, keeps the original untouched for the "Real photo" tab,
renders the 6-second clip on both the light and dark stages, reads the **shell
colour** off the case interior and the **accent** off the artwork, and deploys.

### Telling it which car it is

A photo cannot say which car it is, and guessing is not acceptable on a live
shop — so a photo with no name is fully rendered but **held back from the site**
rather than shown under a wrong model.

Two ways to name one:

```
pic/Porsche - 911 Turbo S.jpeg          name the file, no other step
```
```jsonc
// data/names.json — or name it later, without renaming anything
{ "WhatsApp Image 2026-09-22 at 14.22.11.jpeg": "Porsche - 911 Turbo S" }
```

Add a third part — `Porsche - 911 GT3 RS - Blush` — only to tell two cases of
the same model apart. It shows on the card until you write a caption.

Every build prints what is waiting, and puts it on the Actions run summary
ready to paste:

```
1 case(s) ready but held back — they need a name.
Add to data/names.json:

    "WhatsApp Image 2026-09-22 at 14.22.11.jpeg": "Marque - Model",
```

Naming a case does not re-render anything — the slug comes from the filename,
not the car name, so the clips already built stay valid and it goes live on the
next deploy.

A `names.json` entry also *overrides* a filename, so a wrong name is fixable
without touching the photo.

### When the cut-out will not come out clean

Some photos will not cut cleanly no matter what — a white case shot on white
paper with the rim inside JPEG noise is the hard case, and the rescue above
exists for it. If you can get hold of a version of the picture that already has
its background off, drop it into **`pic/clean/` under the same name as the
photo**:

```
pic/Bugatti - Chiron Pur Sport.jpeg          the photo, as always
pic/clean/Bugatti - Chiron Pur Sport.png     already cut out
```

The pipeline then uses that picture's own alpha instead of cutting one, and
says `own alpha` in the build log. It stretches the alpha first — a supplied
cut-out usually has a soft drop shadow baked in and a body a level or two short
of solid, and the stage lays its own shadow down anyway.

**The photo in `pic/` stays where it is and still feeds the “Real photo” tab.**
That is the point: the card, the 3D view and the clip get the clean edge, and a
customer can still see the original picture of the case.

### Describing it

`blurb` and the "On the case" list are hand-written in `data/overrides.ts`,
keyed by slug. A case works fine without one — its detail sheet just shows less.
**Nothing is generated to fill that gap**, because an invented product
description is what a customer finds out about on delivery.

Overrides can also correct a generated reading:

```ts
'bmw-m3-e30': {
  caption: '“The Boxy”',
  accent: '#3c78dc',   // sampler averaged the red+blue M stripe to purple
  shellLabel: 'Blush', // if the auto name is not the one you use
}
```

### Why a re-rendered case shows up straight away

Every generated file keeps its name for life — re-rendering a case writes over
`bugatti-chiron-pur-sport-md.webp`, it does not write a new file — and the
images go out with a week of cache on them. So a visitor who has seen the site
before would keep the old picture for a week after it was fixed, with nothing
about the deploy looking wrong from the outside.

`scripts/assets.py` therefore hashes the files a browser actually fetches for
each case and writes **`data/rev.json`**. The site hangs that off every asset
URL as `?v=`, so a re-rendered case is a different URL and is fetched again,
while an unchanged one keeps its stamp and stays cached. `data/rev.ts` is the
one-line helper; nothing about it needs maintaining.

### Removing one

Delete the photo from `pic/`. The next build prunes its generated assets and
drops it from the collection.

Copy that names the size of the collection — the hero counters and shell list,
the collection heading, the Fit steps, the marque filters — is all derived from
`cases`, so none of it goes stale.

## When a link is wrong

`app/not-found.tsx` is the page a stale link lands on. A static export has
nothing running to route on, so it is one page for the whole site — it reads
the language out of the address and corrects itself on hydration, which is the
right way round: the correction is a swap of words on a page that already looks
like the site, rather than a blank one waiting for a script. Someone whose
Arabic link has gone stale should not be dropped into English on top of it.

The collection sits underneath it. A dead end on a shop is a wasted visit, and
this list is short enough to be the way back in.

## What loads, and when

The reel under the hero is the heaviest thing on the page — around 700 KB,
several times the HTML and the script together — and `autoPlay` fetches it
while the page is still being parsed, in competition with the fonts and the
case stills a visitor is actually waiting to see.

So `components/ShowReel.tsx` withholds the source until the band is within a
screen of the viewport. Measured on a throttled connection (1.6 Mbps, 150 ms
latency), downloaded before anything appears on screen:

| | before first paint |
| --- | --- |
| `autoPlay` + `preload="metadata"` | 1,097 KB |
| source withheld until near | 383 KB |

The poster is a still of the first frame and loads immediately, so the band is
never an empty hole while it waits.

**Fonts are fetched, not preloaded, for Arabic.** Noto Sans Arabic is declared
in the shared layout, and preloading from there put 162 KB of Arabic glyphs in
the critical path of every English page — more than the rest of the fonts put
together, for letters that page will never draw. With `preload: false` the
browser honours the `unicode-range` on the face and fetches it only when Arabic
is actually on the page.

That rule has one trap worth knowing about: the language switcher spells each
language's name in its own script, so a stylesheet rule matching bare
`[lang="ar"]` caught that one link on every English page and pulled the whole
font down to set a single word. The rule is scoped to `.page[lang="ar"]`
instead, and the switcher gets the system Arabic face, which is what it is for.

## Checking the assets

```bash
npm run check
```

Every rule in `scripts/check.py` is one that has already shipped broken once:
a cut-out that hollowed out or grew a white apron, an edge that came out twice
as soft as every other case, a case live in `generated.json` with a clip that
was never rendered, an override keyed to a slug that does not exist, and
secondary text the light theme once set at 3.3:1 — which reads fine to anyone
who can already read it. It runs in CI before anything is deployed and exits
non-zero on the first failure.

The contrast rule reads the two `:root` blocks straight out of `globals.css`
and measures every ink against every surface it is set on, so the palette
cannot drift back under 4.5:1 without the build saying so. Audited with
axe-core at WCAG 2.1 AA across both themes, all three languages and the 404:
no violations.

## Regenerating the images and videos

```bash
npm run assets           # everything
npm run assets:images    # stills only — fast
npm run assets:video     # clips + hero banner — slow, a few minutes
```

Nothing is rebuilt that does not need to be. `scripts/.sources.json` records a
hash of what each output was built from — deliberately not timestamps, because
a CI checkout writes every file's mtime at clone time in no meaningful order,
so comparing those there is a coin toss: one run decides all twenty-eight clips
are stale and spends minutes re-encoding video that was already correct, the
next decides none are.

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
| `public/og/<slug>.jpg` | the 1200×630 card a shared link shows |

The background is removed by flooding white inwards from the edge of the frame.
Only white *connected to the border* goes, which is what keeps the white cases
intact — their shells are enclosed by the case outline, so the flood can never
reach them. That handles thirteen of the fourteen photos, and it is left exactly
as it is, because it is the one that gets the edges right.

**The rescue.** One photo it does not handle. A white case shot on white paper
can have a rim only two or three levels below the backdrop, which is inside JPEG
noise: the threshold flickers on and off row to row, the flood pours through the
gaps and hollows the shell out, leaving an outline around a transparent case.
So the result is measured — a phone case fills 92–95% of its own bounding box,
and far less means the flood got inside it — and only a photo that fails that
check is re-cut.

The re-cut floods the same way, but the flood may only travel through pixels
that are both bright *and flat*. The rim that brightness cannot see still spikes
the local gradient, so demanding flatness walls the flood out of it. The image
is blurred before the gradient is measured, because JPEG noise on its own
produces a gradient of about one level.

That gradient wall says which side of the case you are on, not exactly where the
edge is: it stalls somewhere inside the rim, and a pixel or two further in on
the next row, which reads as a torn white border down the flank and a square-cut
bottom where the case is round. So the four boundary curves are snapped back
onto the rim — the only thing separating a white case wall from white paper is
that thin dark line — and run through a short median: long enough to lose the
jitter, short enough to keep the volume buttons.

Rows and columns are two directions, though, and a median lands on whole pixels,
so that still leaves a one-pixel staircase down the flanks and a flat facet
where the two meet at a corner. Both go the same way: the silhouette is blurred
and re-cut at half coverage — the usual stand-in for curvature flow. It is the
same in every direction, so it cannot favour rows over columns, and it rubs out
detail finer than itself while leaving the buttons alone.

What comes back is a mask, like the plain flood's, so it takes the same feather
afterwards. That matters for how it looks next to the others: measured across
the middle half of each case, the rescued edge fades over 1.03px and the plain
flood's over 1.03–1.06px, so no case reads softer than its neighbours on a card.

Throughout, the threshold is read from each photo's own backdrop rather than
fixed, and only the largest region is kept so a speck of sensor noise out in the
paper cannot drag the crop out to meet it.

**The printed artwork is never edited, recoloured or retouched** — the videos
are the real photo lit on a studio background, and the “Real photo” tab on every
product shows the untouched original so a customer can always check.

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
