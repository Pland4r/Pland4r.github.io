#!/usr/bin/env python3
"""
MA Cases — asset checks.

Every rule here is one that has already been broken at least once, caught by
eye, and would have shipped otherwise:

  * a cut-out that hollowed out, or grew a white apron off the bottom
  * an edge that came out twice as soft as every other case, so one card looked
    woolly next to the rest
  * a case live in generated.json with a clip that was never rendered
  * an override keyed to a slug that does not exist, silently doing nothing

    python scripts/check.py        # or: npm run check

Exits non-zero on the first failing rule, so CI stops before deploying.
"""

from __future__ import annotations

import json
import os
import re
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import assets  # noqa: E402

# A phone case fills most of its own bounding box: much less means the
# background flood got inside it, much more means it swallowed the backdrop.
FILL = (0.90, 0.98)

# How far the alpha takes to fade out, in pixels, measured across the middle
# half of the case. The plain flood lands at 1.03-1.06, and anything far off
# that reads as a different material next to its neighbours on a card.
RAMP = (0.5, 1.6)

OG_SIZE = (1200, 630)

failures: list[str] = []


def check(rule: str, ok: bool, detail: str = "") -> None:
    """`detail` explains the failure, so it is only printed when there is one."""
    print(f"  {'ok  ' if ok else 'FAIL'}  {rule}" + (f"  — {detail}" if detail and not ok else ""))
    if not ok:
        failures.append(rule)


def fill_ratio(alpha: np.ndarray) -> float:
    mask = alpha > 128
    ys, xs = np.nonzero(mask)
    if len(ys) == 0:
        return 0.0
    return float(mask[ys.min():ys.max() + 1, xs.min():xs.max() + 1].mean())


def edge_ramp(alpha: np.ndarray) -> float:
    """Mean width of the fade at the right-hand edge, in pixels."""
    h = alpha.shape[0]
    widths = []
    for y in range(int(h * 0.25), int(h * 0.75)):
        row = alpha[y]
        solid = np.nonzero(row > 248)[0]
        if not len(solid):
            continue
        x = solid[-1] + 1
        n = 0
        while x < len(row) and row[x] > 8:
            n += 1
            x += 1
        widths.append(n)
    return float(np.mean(widths)) if widths else 0.0


def main() -> int:
    with open(assets.GENERATED, encoding="utf-8") as f:
        generated = json.load(f)
    live = [e for e in generated if e["named"]]
    print(f"{len(generated)} case(s), {len(live)} live\n")

    # ---------------------------------------------------------------- per case
    for entry in generated:
        slug = entry["slug"]
        png = os.path.join(assets.CASES, f"{slug}.png")

        wanted = [
            png,
            os.path.join(assets.CASES, f"{slug}.webp"),
            os.path.join(assets.CASES, f"{slug}-md.webp"),
            os.path.join(assets.PHOTO, f"{slug}.webp"),
            os.path.join(assets.OG, f"{slug}.jpg"),
            os.path.join(assets.VIDEO, f"{slug}.mp4"),
            os.path.join(assets.VIDEO, f"{slug}-poster.webp"),
            os.path.join(assets.VIDEO, "dark", f"{slug}.mp4"),
            os.path.join(assets.VIDEO, "dark", f"{slug}-poster.webp"),
        ]
        missing = [os.path.relpath(p, assets.ROOT) for p in wanted if not os.path.exists(p)]
        check(f"{slug}: every asset present", not missing, ", ".join(missing))
        if missing:
            continue

        alpha = np.asarray(Image.open(png).convert("RGBA"))[:, :, 3]

        check(f"{slug}: has a cut-out at all", bool((alpha == 0).any()),
              "nothing is transparent, so the background was never removed")

        ratio = fill_ratio(alpha)
        check(f"{slug}: fill {ratio:.3f} within {FILL}", FILL[0] <= ratio <= FILL[1])

        ramp = edge_ramp(alpha)
        check(f"{slug}: edge ramp {ramp:.2f}px within {RAMP}", RAMP[0] <= ramp <= RAMP[1])

        og = Image.open(os.path.join(assets.OG, f"{slug}.jpg"))
        check(f"{slug}: link card is {OG_SIZE[0]}x{OG_SIZE[1]} JPEG",
              og.size == OG_SIZE and og.format == "JPEG", f"{og.size} {og.format}")

    # ------------------------------------------------------------- whole index
    print()
    slugs = {e["slug"] for e in generated}

    with open(os.path.join(assets.ROOT, "data", "rev.json"), encoding="utf-8") as f:
        revs = json.load(f)
    stamped = set(revs) - {"hero"}
    check("every case is stamped in rev.json", stamped == slugs,
          f"only in one: {sorted(stamped ^ slugs)}")
    check("the hero is stamped", "hero" in revs)

    # An override keyed to a slug that does not exist is a typo that shows up as
    # missing copy on the site rather than as an error anywhere.
    overrides = os.path.join(assets.ROOT, "data", "overrides.ts")
    with open(overrides, encoding="utf-8") as f:
        keyed = set(re.findall(r"^  '([a-z0-9-]+)':", f.read(), re.M))
    check("every override matches a real case", keyed <= slugs,
          f"no such case: {sorted(keyed - slugs)}")

    check("live cases have a marque and a model",
          all(e["marque"] and e["model"] for e in live))

    for name in ("hero.mp4", "hero-poster.webp"):
        for folder in (assets.VIDEO, os.path.join(assets.VIDEO, "dark")):
            path = os.path.join(folder, name)
            check(f"{os.path.relpath(path, assets.ROOT)} present", os.path.exists(path))

    print()
    if failures:
        print(f"{len(failures)} check(s) failed.")
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
