#!/usr/bin/env python3
"""
MA Cases — mockup prompts.

The staged mockups in /social/mockups are the supplier photo moved around a
room. They cannot invent what the photo does not contain: the camera module
stays flat because it is a picture of a module, and the small print stays
unreadable because it is unreadable in the photo.

An image model can rebuild all of that, which is how the five reference shots
in /social/simillar were made. This writes the prompts to do it for every case,
one file per case, five shots each, matching those five references:

    social/mockups/prompts/<slug>.md

Each prompt names the car, the shell colour sampled off the real photo, and
what is actually printed on that case — taken from the caption files, which
already record it for the "what does it say?" replies. Attach the case's own
photo from /pic alongside the prompt; the prompt is written to keep the model
from redrawing it.

Usage
    python scripts/prompts.py
    python scripts/prompts.py porsche-911-brabus
"""

from __future__ import annotations

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from assets import SRC, accent_of, clean_cutout, cutout, discover, shell_of  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAPTIONS = os.path.join(ROOT, "social", "captions")
OUT = os.path.join(ROOT, "social", "mockups", "prompts")


# The part every shot repeats: what the case is, and the standing order not to
# improve it. Models will otherwise re-letter the small print into clean
# sentences and add lenses the case does not have, and then the picture is
# promising a customer something the parcel will not contain.
FIDELITY = """Use the attached photograph as the exact artwork of the case. Reproduce the \
print faithfully: the same layout, the same typography, the same car illustration, the same \
colours, every element in the same place and at the same size. Do not redesign it, do not \
re-letter it, do not re-crop it, do not add or remove anything. The small body text must stay \
exactly as soft and as unreadable as it is in the attached photograph — do not turn it into \
legible sentences. Keep the camera cut-out exactly the shape and lens count it has in the \
photograph."""

PRODUCT = """The product: a glossy hard-shell phone case in {shell} ({hex}), fitted on the \
phone, with the camera cut-out at the top left — the lens module sitting proud of the back, \
its lenses deep in their metal rings — and moulded button cut-outs down the sides."""

SHOTS = [
    ("studio", "2:3 vertical", """Studio product photograph of a phone case, shot dead straight on.

{fidelity}

{product}

The shot: straight on, the case upright and centred, filling about 85% of the frame height. \
Seamless light grey studio backdrop, a little brighter behind the case, a soft horizon low in \
the frame and a polished floor beneath. A large softbox from the front and slightly above, so \
the shell's rounded edges catch a clean line of light. A tight, dark contact shadow where the \
case meets the floor, a faint reflection below it. Commercial product photography, sharp \
corner to corner, no props, no added text, no watermark, no logo."""),

    ("angle", "2:3 vertical", """Studio product photograph of a phone case, three-quarter view.

{fidelity}

{product}

The shot: the case standing upright and turned about 30 degrees, so one whole side wall is \
visible along its full length with the button cut-outs moulded into it — the near edge taller \
than the far one, the far edge foreshortened. The case fills about 85% of the frame height, \
set slightly left of centre. Seamless light grey studio backdrop, polished floor, soft \
reflection, key light from the upper left. A tight dark contact shadow at the base. \
Commercial product photography, sharp, no props, no added text, no watermark."""),

    ("macro", "2:3 vertical", """Extreme close-up product photograph of a phone case, 100mm macro at f/2.8.

{fidelity}

{product}

The shot: tight on the camera corner, the lens module filling the upper half of the frame with \
its lenses sharp and their metal rings catching the light, the first line of the printed \
artwork below it. The case runs off the left, right and bottom edges of the frame. The case is \
turned slightly so its top-left edge rolls away from the lens. Shallow depth of field: the \
module is sharp, the grey background behind falls right out of focus, the lower part of the \
case softens. Soft directional light from the upper left. No props, no added text, no \
watermark."""),

    ("night", "2:3 vertical", """Dark, low-key product photograph of a phone case.

{fidelity}

{product}

The shot: the case propped at a slight angle against a block of rough dark stone, standing on a \
carbon-fibre surface, with an out-of-focus alloy wheel deep in the background. Near-black room. \
The only colour in it is a {accent} light raking in from behind and to the right, catching the \
case's edges and spilling onto the stone and the floor. Deep blacks, a wet-looking reflection \
under the case, a hard shadow beneath it. Dramatic automotive-advertising lighting, the case \
itself clearly lit and readable. No props beyond those named, no added text, no watermark."""),

    ("flat", "3:2 horizontal", """Overhead product photograph of a phone case lying on a desk.

{fidelity}

{product}

The shot: seen from above and slightly in front, the case lying face up on a smooth dark grey \
desk, turned about 45 degrees so it runs corner to corner across the frame and overruns the \
edges. The bottom end of the case is nearest the lens, close enough to show the charging-port \
cut-out and the speaker slots through it, and one side wall is visible with its button \
cut-outs. Soft window light from the upper left, a soft shadow falling away to the lower right. \
Commercial flat-lay, sharp, no props, no added text, no watermark."""),
]


def printed(slug: str) -> list[str]:
    """What this case actually says, as the captions already record it."""
    if not os.path.isdir(CAPTIONS):
        return []
    for name in sorted(os.listdir(CAPTIONS)):
        match = re.match(r"^\d+-(.+)-\d+$", os.path.splitext(name)[0])
        if not match or match.group(1) != slug:
            continue
        with open(os.path.join(CAPTIONS, name), encoding="utf-8") as handle:
            body = handle.read()
        if "ON THE CASE" not in body:
            continue
        lines = body.split("ON THE CASE", 1)[1].splitlines()[1:]
        return [ln.strip().lstrip("- ").strip() for ln in lines if ln.strip().startswith("-")]
    return []


def page(entry: dict, shell: tuple[str, str], accent: str) -> str:
    name = " ".join(x for x in (entry["marque"], entry["model"], entry["variant"]) if x)
    name = name or entry["slug"]
    hex_value, shell_name = shell

    out = [f"# {name} — mockup prompts", ""]
    out += [f"Attach this photo to every one of them: `pic/{entry['file']}`", ""]
    out += [f"Shell: **{shell_name}** `{hex_value}` · strongest colour in the print: `{accent}`",
            ""]

    says = printed(entry["slug"])
    if says:
        out += ["What is printed on this case, so you can check the model did not rewrite it:",
                ""]
        out += [f"- {line}" for line in says] + [""]

    product = PRODUCT.format(shell=shell_name.lower(), hex=hex_value)
    for i, (shot, ratio, body) in enumerate(SHOTS, 1):
        out += ["---", "", f"## {i} · {shot} — {ratio}", "", "```"]
        out += [body.format(fidelity=FIDELITY, product=product, accent=accent).strip()]
        out += ["", f"{ratio}, photorealistic, no text overlay.", "```", ""]
    return "\n".join(out)


README = """# Prompts for the staged shots

One file per case, five prompts each — the same five shots as the references in
`social/simillar`. Open the file for the case you want, attach that case's photo
from `/pic`, and run the prompt.

Rebuild them whenever the catalogue changes:

```bash
npm run assets:prompts
```

## Check every picture before it goes out

Image models tidy things up, and two of the things they tidy will misrepresent
the product:

1. **The small print.** On most of these cases the body text is deliberately
   unreadable — it is unreadable on the real case and in the supplier photo.
   A model will often "fix" it into crisp, legible sentences. Each case file
   lists what that case actually says, so you can tell. If the model wrote
   paragraphs, throw the picture out.
2. **The camera cut-out.** Some of these cases are cut for two lenses, some for
   three. A model will happily give a two-lens case three. If the cut-out does
   not match the photo you attached, throw the picture out.

Anything that survives both checks is showing a customer the case they will
actually receive, which is the rule the rest of the shop runs on.

## Where they go

Drop the finished images into `social/mockups/` as `<slug>-<shot>.jpg` and they
sit alongside the composited ones, which stay as the fallback for any case you
have not regenerated. The composited set is rebuilt with
`npm run assets:mockups`.
"""


def build(only: list[str] | None = None) -> None:
    os.makedirs(OUT, exist_ok=True)
    entries = [e for e in discover() if not only or e["slug"] in only]

    if only:
        for slug in sorted(set(only) - {e["slug"] for e in entries}):
            print(f"  ? no case called {slug}")

    for entry in entries:
        case = clean_cutout(entry["clean"]) if entry["clean"] else cutout(
            os.path.join(SRC, entry["file"]))
        path = os.path.join(OUT, f"{entry['slug']}.md")
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(page(entry, shell_of(case), accent_of(case)))
        print(f"  {os.path.relpath(path, ROOT)}")

    with open(os.path.join(OUT, "README.md"), "w", encoding="utf-8", newline="\n") as handle:
        handle.write(README)
    print(f"  {os.path.relpath(os.path.join(OUT, 'README.md'), ROOT)}")


if __name__ == "__main__":
    build(sys.argv[1:] or None)
