#!/usr/bin/env python3
"""
MA Cases — build the logo mark from the generated artwork.

The source is the "MA" emblem sitting above a "MA CASES" wordmark, drawn in
white/red/green on black with a heavy glow. This keeps only the emblem, drops
the words, strips the bloom, and repaints it in the site's own palette.

Why repaint rather than colour-correct: the artwork is drawn on black with the
glow baked in, so un-compositing it (dividing by coverage) turns the halo into
solid white instead of removing it. Separating each ink by hue and thresholding
it on its own channel isolates the shapes cleanly — measured at 235 for the
whites, where the letters, arch, zellige panel and car silhouette all resolve
and the glow does not.

Outputs:
    public/brand/ma-mark-on-dark.png    for dark surfaces
    public/brand/ma-mark-on-light.png   for light surfaces
    app/icon.png                        favicon, mark on a dark tile

Usage:  python scripts/brand.py
"""

from __future__ import annotations

import os

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "ChatGPT Image 21 sept. 2026, 16_10_28.png")
OUT = os.path.join(ROOT, "public", "brand")

# The wordmark starts at y=646; the emblem's last solid row is y=614.
MARK_BOTTOM = 632

# Each ink gets a narrow ramp on its own channel. 226 lets the bloom flood in,
# 243 starts eating the shapes; 233-243 is the band that holds the artwork.
WHITE_RAMP = (233, 243)
RED_RAMP = (208, 234)
GREEN_RAMP = (96, 120)

# Speckles smaller than this are bloom artefacts, not artwork.
MIN_BLOB = 90

# Straight from the `:root` blocks in app/globals.css. The arch and the star
# both take the accent, so the mark carries no colour the site does not.
PALETTE = {
    "light": {"ink": (29, 29, 31), "accent": (0, 113, 227)},
    "dark": {"ink": (245, 245, 247), "accent": (41, 151, 255)},
}

WHITE, ACCENT = 0, 1


def _ramp(v: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return np.clip((v - lo) / (hi - lo), 0, 1)


def extract(path: str) -> tuple[np.ndarray, np.ndarray]:
    """
    Return (alpha, kind) for the emblem, cropped to its bounding box.

    `kind` marks each pixel as WHITE (the letters, zellige panel and car) or
    ACCENT (the arch and the star), so a variant can be painted in any two
    colours without re-reading the source.
    """
    full = Image.open(path).convert("RGB")
    a = np.asarray(full.crop((0, 0, full.width, MARK_BOTTOM))).astype(np.float32)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    sat = a.max(axis=2) - a.min(axis=2)

    is_red = (sat > 80) & (r >= g) & (r >= b)
    is_green = (sat > 40) & (g > r) & (g > b)
    is_white = sat <= 40

    a_white = _ramp(a.max(axis=2), *WHITE_RAMP) * is_white
    a_red = _ramp(r, *RED_RAMP) * is_red
    a_green = _ramp(g, *GREEN_RAMP) * is_green

    a_accent = np.maximum(a_red, a_green)
    alpha = np.maximum(a_white, a_accent)
    kind = np.where(a_accent > a_white, ACCENT, WHITE).astype(np.uint8)

    # Drop isolated bloom specks.
    labels, n = ndimage.label(alpha > 0.25)
    if n:
        sizes = ndimage.sum(np.ones_like(labels), labels, range(1, n + 1))
        small = [i + 1 for i, s in enumerate(sizes) if s < MIN_BLOB]
        if small:
            alpha[np.isin(labels, small)] = 0.0

    ys, xs = np.where(alpha > 0.06)
    pad = 10
    y0, y1 = max(0, ys.min() - pad), min(alpha.shape[0], ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(alpha.shape[1], xs.max() + 1 + pad)
    return alpha[y0:y1, x0:x1], kind[y0:y1, x0:x1]


def paint(alpha: np.ndarray, kind: np.ndarray, ink, accent) -> Image.Image:
    rgb = np.zeros((*alpha.shape, 3), np.float32)
    rgb[kind == WHITE] = ink
    rgb[kind == ACCENT] = accent
    return Image.fromarray(np.dstack([rgb, alpha * 255.0]).astype(np.uint8), "RGBA")


def favicon(mark: Image.Image, size: int = 512) -> Image.Image:
    """The dark-surface mark on a dark rounded tile, so it reads on any chrome."""
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    plate = Image.new("RGBA", (size, size), (10, 10, 12, 255))
    rounded = Image.new("L", (size, size), 0)
    ImageDraw.Draw(rounded).rounded_rectangle(
        (0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=255
    )
    tile.paste(plate, (0, 0), rounded)

    inner = int(size * 0.74)
    scale = min(inner / mark.width, inner / mark.height)
    art = mark.resize((int(mark.width * scale), int(mark.height * scale)), Image.LANCZOS)
    tile.alpha_composite(art, ((size - art.width) // 2, (size - art.height) // 2))
    return tile


if __name__ == "__main__":
    if not os.path.exists(SOURCE):
        raise SystemExit(f"source artwork not found: {SOURCE}")

    os.makedirs(OUT, exist_ok=True)
    alpha, kind = extract(SOURCE)

    variants = {}
    for theme, colours in PALETTE.items():
        art = paint(alpha, kind, colours["ink"], colours["accent"])
        art.save(os.path.join(OUT, f"ma-mark-on-{theme}.png"), optimize=True)
        variants[theme] = art

    favicon(variants["dark"]).save(os.path.join(ROOT, "app", "icon.png"), optimize=True)

    print(f"  mark  {alpha.shape[1]}x{alpha.shape[0]}")
    for theme, colours in PALETTE.items():
        name = f"ma-mark-on-{theme}.png"
        kb = os.path.getsize(os.path.join(OUT, name)) / 1024
        print(f"  {name:24s} {kb:4.0f} KB   ink {colours['ink']}  accent {colours['accent']}")
    icon_kb = os.path.getsize(os.path.join(ROOT, "app", "icon.png")) / 1024
    print(f"  app/icon.png             {icon_kb:4.0f} KB")
