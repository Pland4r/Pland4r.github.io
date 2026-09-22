#!/usr/bin/env python3
"""
MA Cases — asset pipeline.

Turns the raw product photos in /pic into everything the site serves:

    public/cases/<slug>.png          transparent cut-out, full resolution
    public/cases/<slug>.webp         same, smaller
    public/cases/<slug>-md.webp      card-sized still
    public/cases/photo/<slug>.webp   the ORIGINAL photo, unedited
    public/video/<slug>.mp4          6s looping product clip + poster
    public/video/hero.mp4            hero banner loop + poster
    public/video/dark/...            the same clips on a dark stage

The cut-out only ever removes the studio background — the printed artwork is
never touched, resized against its shell, or recoloured.

Usage
    python scripts/assets.py            # everything
    python scripts/assets.py images     # stills only (fast)
    python scripts/assets.py video      # clips + hero, every case
    python scripts/assets.py video <slug>...   # only those clips, plus the hero

Requires: pillow, numpy, scipy, and ffmpeg on PATH.
    python -m pip install pillow numpy scipy
"""

from __future__ import annotations

import json
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "pic")
CASES = os.path.join(ROOT, "public", "cases")
PHOTO = os.path.join(CASES, "photo")
VIDEO = os.path.join(ROOT, "public", "video")

FPS = 30

# Photos are discovered, not listed. Drop a file into /pic named
#
#     Marque - Model.jpeg              e.g.  Porsche - 911 Turbo S.jpeg
#     Marque - Model - Variant.jpeg    e.g.  Porsche - 911 GT3 RS - Blush.jpeg
#
# and it becomes a product. The variant is optional and only needed to tell two
# cases of the same model apart; it also lands on the card as the caption.
PHOTO_TYPES = (".jpeg", ".jpg", ".png", ".webp")

# Written by this script and read by data/cases.ts.
GENERATED = os.path.join(ROOT, "data", "generated.json")


def slugify(text: str) -> str:
    out = []
    for ch in text.lower():
        if ch.isalnum():
            out.append(ch)
        elif out and out[-1] != "-":
            out.append("-")
    return "".join(out).strip("-")


def parse_name(filename: str) -> dict | None:
    """`Marque - Model[ - Variant].ext` -> the fields we can know from a name."""
    stem = os.path.splitext(filename)[0]
    parts = [p.strip() for p in stem.split(" - ") if p.strip()]
    if len(parts) < 2:
        return None

    marque, model = parts[0], parts[1]
    variant = parts[2] if len(parts) > 2 else ""
    slug = slugify(f"{marque} {model} {variant}".strip())
    return {"slug": slug, "marque": marque, "model": model, "variant": variant}


def discover() -> list[dict]:
    """Every parseable photo in /pic, in a stable order."""
    found, skipped = [], []
    for name in sorted(os.listdir(SRC)):
        if not name.lower().endswith(PHOTO_TYPES):
            continue
        meta = parse_name(name)
        if meta is None:
            skipped.append(name)
            continue
        meta["file"] = name
        found.append(meta)

    for name in skipped:
        print(f"  ! skipped (needs 'Marque - Model' in the name): {name}")
    return found


# ------------------------------------------------------------ colour sampling

def _hex(rgb) -> str:
    return "#%02x%02x%02x" % tuple(int(max(0, min(255, v))) for v in rgb)


def shell_of(case: Image.Image) -> tuple[str, str]:
    """
    The shell colour, taken as the median of the case interior.

    Not the rim: these shells are glossy, so the outer edge carries a specular
    highlight that reads as white on every case regardless of its real colour.
    The print sits directly on the shell and its background dominates the area,
    so the interior median lands on the shell colour instead.
    """
    arr = np.asarray(case).astype(np.float32)
    inside = ndimage.binary_erosion(arr[:, :, 3] > 200, iterations=14)
    if inside.sum() < 500:
        inside = arr[:, :, 3] > 200

    rgb = np.median(arr[:, :, :3][inside], axis=0)
    r, g, b = rgb
    mx, mn = float(rgb.max()), float(rgb.min())
    light = mx / 255.0
    sat = (mx - mn) / mx if mx else 0.0

    if sat < 0.13:
        if light > 0.72:
            return _hex(rgb), "Gloss White"
        if light < 0.30:
            return _hex(rgb), "Gloss Black"
        return _hex(rgb), "Graphite" if light < 0.55 else "Silver"

    hue = float(np.degrees(np.arctan2(3 ** 0.5 * (g - b), 2 * r - g - b)) % 360)
    names = [
        (15, "Red"), (45, "Amber"), (70, "Gold"), (160, "Green"),
        (200, "Teal"), (255, "Blue"), (290, "Violet"), (330, "Pink"), (360, "Red"),
    ]
    name = next(n for edge, n in names if hue < edge)

    if light < 0.30:
        return _hex(rgb), "Gloss Black"
    if name in ("Red", "Pink", "Violet") and sat < 0.40:
        name = "Dusty Pink" if light > 0.5 else "Deep Rose"
    elif light > 0.72:
        name = f"Light {name}"
    elif light < 0.40:
        name = f"Deep {name}"
    return _hex(rgb), name


def accent_of(case: Image.Image) -> str:
    """
    The strongest colour in the artwork, used for the card glow and the bloom
    behind the case in the dark clips. Greyscale artwork falls back to a cool
    neutral rather than inventing a hue.
    """
    arr = np.asarray(case).astype(np.float32)
    inside = ndimage.binary_erosion(arr[:, :, 3] > 200, iterations=6)
    px = arr[:, :, :3][inside] if inside.sum() > 500 else arr[:, :, :3][arr[:, :, 3] > 200]
    if len(px) == 0:
        return "#8aa0c0"

    mx, mn = px.max(axis=1), px.min(axis=1)
    sat = np.divide(mx - mn, np.maximum(mx, 1))
    strong = px[(sat > 0.34) & (mx > 70)]
    if len(strong) < max(200, len(px) * 0.004):
        return "#8aa0c0"

    rgb = np.median(strong, axis=0)
    # Lift it so it still reads as a glow against a dark stage.
    peak = max(rgb.max(), 1.0)
    return _hex(rgb * (215.0 / peak))


# --------------------------------------------------------------------- cut-out

def _trim_black_bars(a: np.ndarray) -> tuple[int, int, int, int]:
    """Screenshots arrive letterboxed; drop any solid black border rows/cols."""
    h, w = a.shape[:2]
    top = 0
    while top < h - 10 and a[top].max() < 40:
        top += 1
    bottom = h - 1
    while bottom > 10 and a[bottom].max() < 40:
        bottom -= 1
    left = 0
    while left < w - 10 and a[:, left].max() < 40:
        left += 1
    right = w - 1
    while right > 10 and a[:, right].max() < 40:
        right -= 1
    return top, bottom + 1, left, right + 1


def cutout(path: str, tol: int = 246, feather: float = 1.2) -> Image.Image:
    """
    Lift the case off its white studio background.

    Only white that is *connected to the border* is removed, which is what keeps
    the white cases intact — their shells are enclosed by the case outline, so
    they are never reachable from the edge of the frame.
    """
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(np.int16)

    top, bottom, left, right = _trim_black_bars(a)
    a = a[top:bottom, left:right]
    im = im.crop((left, top, right, bottom))
    h, w = a.shape[:2]

    near_white = (a[:, :, 0] >= tol) & (a[:, :, 1] >= tol) & (a[:, :, 2] >= tol)

    labels, _ = ndimage.label(near_white)
    border = set(labels[0, :]) | set(labels[-1, :]) | set(labels[:, 0]) | set(labels[:, -1])
    border.discard(0)
    outside = np.isin(labels, list(border))

    alpha = (~outside).astype(np.float32) * 255.0
    solid = ndimage.binary_fill_holes(alpha > 127)
    alpha = np.maximum(alpha, solid.astype(np.float32) * 255.0)

    # Soften then re-tighten the edge: anti-aliased, but not a halo.
    blurred = Image.fromarray(alpha.astype(np.uint8), "L").filter(
        ImageFilter.GaussianBlur(feather)
    )
    alpha = np.clip((np.asarray(blurred).astype(np.float32) - 90) * (255.0 / 90.0), 0, 255)
    alpha = alpha.astype(np.uint8)

    out = im.convert("RGBA")
    out.putalpha(Image.fromarray(alpha, "L"))

    ys, xs = np.where(alpha > 8)
    pad = 6
    return out.crop(
        (
            max(0, xs.min() - pad),
            max(0, ys.min() - pad),
            min(w, xs.max() + 1 + pad),
            min(h, ys.max() + 1 + pad),
        )
    )


def _fresh(target: str, source: str) -> bool:
    """True when `target` already exists and is newer than the photo."""
    return (
        os.path.exists(target)
        and os.path.getmtime(target) >= os.path.getmtime(source)
    )


def build_images(force: bool = False) -> list[dict]:
    """
    Cut out every discovered photo and write data/generated.json.

    Existing output newer than its photo is left alone, so re-running after
    adding one case does not redo the others.
    """
    os.makedirs(CASES, exist_ok=True)
    os.makedirs(PHOTO, exist_ok=True)

    entries = []
    for meta in discover():
        slug, src = meta["slug"], os.path.join(SRC, meta["file"])
        png = os.path.join(CASES, f"{slug}.png")

        if force or not _fresh(png, src):
            out = cutout(src)
            out.save(png, optimize=True)
            out.save(os.path.join(CASES, f"{slug}.webp"), quality=92, method=6)
            scale = 900 / out.height
            out.resize((int(out.width * scale), 900), Image.LANCZOS).save(
                os.path.join(CASES, f"{slug}-md.webp"), quality=88, method=6
            )
            # The untouched original, shown behind the "Real photo" tab.
            Image.open(src).convert("RGB").save(
                os.path.join(PHOTO, f"{slug}.webp"), quality=90, method=6
            )
            note = "cut out"
        else:
            out = Image.open(png).convert("RGBA")
            note = "up to date"

        swatch, shell_label = shell_of(out)
        entries.append({
            "slug": slug,
            "marque": meta["marque"],
            "model": meta["model"],
            "variant": meta["variant"],
            "shellLabel": shell_label,
            "swatch": swatch,
            "accent": accent_of(out),
        })
        print(f"  {slug:26s} {out.size[0]:>4}x{out.size[1]:<5} {shell_label:<12} {note}")

    with open(GENERATED, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"  -> data/generated.json ({len(entries)} cases)")
    return entries


def catalogue() -> list[dict]:
    """The generated entries, read back without redoing any image work."""
    if not os.path.exists(GENERATED):
        return build_images()
    with open(GENERATED, encoding="utf-8") as f:
        return json.load(f)


# ----------------------------------------------------------------------- video

def _load(slug: str, target_h: int) -> Image.Image:
    im = Image.open(os.path.join(CASES, f"{slug}.png")).convert("RGBA")
    scale = target_h / im.height
    return im.resize((max(1, int(im.width * scale)), target_h), Image.LANCZOS)


def _backdrop(w: int, h: int, accent: tuple[int, int, int], dark: bool = False) -> np.ndarray:
    """
    A studio stage with a pool of light at its centre, so the product never sits
    on flat paper. Rendered in both themes because a white-stage clip inside a
    dark page (or the reverse) reads as a bug.
    """
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dist = np.sqrt(((xx - w * 0.5) / (w * 0.78)) ** 2 + ((yy - h * 0.44) / (h * 0.9)) ** 2)
    lift = np.clip(1.0 - dist, 0, 1)

    base = np.zeros((h, w, 3), np.float32)
    if dark:
        centre = np.array([30, 31, 38], np.float32)
        edge = np.array([9, 9, 12], np.float32)
        falloff, tint_k, tint_ref = 1.6, 0.20, 0.0
    else:
        centre = np.array([255, 255, 255], np.float32)
        edge = np.array([234, 234, 239], np.float32)
        falloff, tint_k, tint_ref = 1.35, 0.10, 235.0

    for c in range(3):
        base[:, :, c] = edge[c] + (centre[c] - edge[c]) * (lift ** falloff)

    # A whisper of the case's own colour, so each clip still feels like itself.
    tint = (lift ** 5.0)[:, :, None] * (np.array(accent, np.float32) - tint_ref)[None, None, :] * tint_k
    return np.clip(base + tint, 0, 255)


def _glow(alpha, accent, w, h, ox, oy, strength=0.45, blur=55) -> np.ndarray:
    """A coloured bloom behind the case. The dark stage's answer to a shadow."""
    layer = Image.new("L", (w, h), 0)
    layer.paste(Image.fromarray(alpha, "L"), (ox, oy))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    g = np.asarray(layer).astype(np.float32) / 255.0
    return g[:, :, None] * np.array(accent, np.float32)[None, None, :] * strength


def _shadow(alpha, w, h, ox, oy, strength=0.5, blur=45, darkness=150.0) -> np.ndarray:
    """A soft cast shadow. Returned as a negative layer to subtract from the stage."""
    layer = Image.new("L", (w, h), 0)
    layer.paste(Image.fromarray(alpha, "L"), (ox, oy))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    s = np.asarray(layer).astype(np.float32) / 255.0
    return s[:, :, None] * np.array([darkness, darkness, darkness * 0.96], np.float32)[None, None, :] * strength


def _composite(bg, rgb, alpha, ox, oy, w, h) -> np.ndarray:
    ch, cw = alpha.shape
    x0, y0 = max(0, ox), max(0, oy)
    x1, y1 = min(w, ox + cw), min(h, oy + ch)
    if x1 <= x0 or y1 <= y0:
        return bg
    sx, sy = x0 - ox, y0 - oy
    a = alpha[sy:sy + (y1 - y0), sx:sx + (x1 - x0)][:, :, None] / 255.0
    c = rgb[sy:sy + (y1 - y0), sx:sx + (x1 - x0)]
    bg[y0:y1, x0:x1] = bg[y0:y1, x0:x1] * (1 - a) + c * a
    return bg


def _encode(frames, path: str, w: int, h: int, crf: int) -> None:
    proc = subprocess.Popen(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", str(FPS),
            "-i", "pipe:0", "-an",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", str(crf),
            "-preset", "slow", "-movflags", "+faststart", path,
        ],
        stdin=subprocess.PIPE,
    )
    assert proc.stdin is not None
    for frame in frames:
        proc.stdin.write(frame.astype(np.uint8).tobytes())
    proc.stdin.close()
    if proc.wait() != 0:
        raise RuntimeError(f"ffmpeg failed writing {path}")


def product_clip(slug: str, accent_hex: str, w: int = 1000, h: int = 1000,
                 secs: float = 6.0, dark: bool = False) -> None:
    """A seamless 6s loop: slow float, soft grounding, one specular pass."""
    accent = tuple(int(accent_hex[i:i + 2], 16) for i in (1, 3, 5))
    total = int(FPS * secs)

    case = _load(slug, int(h * 0.78))
    cw, ch = case.size
    rgb = np.asarray(case).astype(np.float32)[:, :, :3]
    alpha = np.asarray(case)[:, :, 3]

    stage = _backdrop(w, h, accent, dark)
    base_x, base_y = (w - cw) // 2, int(h * 0.10)

    yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
    diag = xx * 0.55 + yy * 0.83
    lo, hi = diag.min(), diag.max()

    poster: np.ndarray | None = None

    def frames():
        nonlocal poster
        for i in range(total):
            t = i / total
            frame = stage.copy()
            lift = 10 * math.sin(2 * math.pi * t)
            oy = base_y + int(round(lift))
            ox = base_x + int(round(4 * math.sin(2 * math.pi * t + 1.2)))

            if dark:
                # On black there is nothing for a shadow to fall on, so the case
                # is grounded with its own bloom instead.
                frame += _glow(alpha, accent, w, h, ox, oy, 0.42, 55)
            else:
                # A wide ambient shadow plus a tighter contact one that tightens
                # as the case settles, which is what sells the float.
                frame -= _shadow(alpha, w, h, ox, oy + 46, 0.40, 60)
                frame -= _shadow(alpha, w, h, ox, oy + int(26 - lift), 0.34, 22)
            frame = _composite(frame, rgb, alpha, ox, oy, w, h)

            # Specular pass, masked to the case so the background stays clean.
            pos = lo + (hi - lo + 900) * t - 450
            band = np.exp(-((diag - pos) ** 2) / (2 * 190.0 ** 2)) * (alpha / 255.0) * 0.16
            y0, y1 = max(0, oy), min(h, oy + ch)
            x0, x1 = max(0, ox), min(w, ox + cw)
            if y1 > y0 and x1 > x0:
                frame[y0:y1, x0:x1] += band[y0 - oy:y1 - oy, x0 - ox:x1 - ox][:, :, None] * 255.0

            out = np.clip(frame, 0, 255)
            if i == int(total * 0.12):
                poster = out.copy()
            yield out

    out_dir = os.path.join(VIDEO, "dark") if dark else VIDEO
    os.makedirs(out_dir, exist_ok=True)
    _encode(frames(), os.path.join(out_dir, f"{slug}.mp4"), w, h, crf=21)
    if poster is not None:
        Image.fromarray(poster.astype(np.uint8)).save(
            os.path.join(out_dir, f"{slug}-poster.webp"), quality=86, method=6
        )


def hero_clip(w: int = 1280, h: int = 720, secs: float = 16.0, dark: bool = False) -> None:
    """
    A slow drifting wall of every case, looping on an exact cycle length.

    Deliberately 720p and heavily compressed: it only ever plays behind the
    hero scrim at half opacity, so the detail is invisible but the bytes are
    not — this is the single biggest file a first-time visitor downloads.
    """
    total = int(FPS * secs)
    imgs = [_load(e["slug"], int(h * 0.70)) for e in catalogue()]
    gap = 120
    cycle = sum(im.width for im in imgs) + gap * len(imgs)

    tiles = []
    x = 0
    for _ in range(3):  # three copies so the band never runs dry mid-scroll
        for im in imgs:
            tiles.append((x, np.asarray(im).astype(np.float32)[:, :, :3], np.asarray(im)[:, :, 3], im.width))
            x += im.width + gap

    stage = _backdrop(w, h, (120, 150, 210) if dark else (235, 238, 245), dark)
    top = int(h * 0.16)
    poster: np.ndarray | None = None

    def frames():
        nonlocal poster
        for i in range(total):
            t = i / total
            frame = stage.copy()
            shift = int(round(t * cycle)) + cycle // 2
            for k, (tx, rgb, alpha, tw) in enumerate(tiles):
                ox = tx - shift
                if ox < -tw - 40 or ox > w + 40:
                    continue
                oy = top + int(round(14 * math.sin(2 * math.pi * (t + k * 0.17))))
                if dark:
                    frame += _glow(alpha, (120, 150, 210), w, h, ox, oy, 0.20, 60)
                else:
                    frame -= _shadow(alpha, w, h, ox, oy + 34, 0.30, 46)
                frame = _composite(frame, rgb, alpha, ox, oy, w, h)

            out = np.clip(frame, 0, 255)
            if i == int(total * 0.25):
                poster = out.copy()
            yield out

    out_dir = os.path.join(VIDEO, "dark") if dark else VIDEO
    os.makedirs(out_dir, exist_ok=True)
    _encode(frames(), os.path.join(out_dir, "hero.mp4"), w, h, crf=30)
    if poster is not None:
        Image.fromarray(poster.astype(np.uint8)).save(
            os.path.join(out_dir, "hero-poster.webp"), quality=84, method=6
        )


def build_video(only: list[str] | None = None) -> None:
    """
    Both themes. Light lands in public/video, dark in public/video/dark.

    `only` limits which product clips are rendered — adding a case should not
    cost a re-render of the ones that have not changed. The hero is always
    rebuilt, since it is a band of every case.
    """
    os.makedirs(VIDEO, exist_ok=True)
    entries = [e for e in catalogue() if not only or e["slug"] in only]

    for dark in (False, True):
        label = "dark" if dark else "light"
        out_dir = os.path.join(VIDEO, "dark") if dark else VIDEO
        rendered = 0
        for e in entries:
            slug = e["slug"]
            clip = os.path.join(out_dir, f"{slug}.mp4")
            src = os.path.join(CASES, f"{slug}.png")
            if not only and _fresh(clip, src):
                print(f"  clip  {label:5s} {slug} — up to date", flush=True)
                continue
            print(f"  clip  {label:5s} {slug}", flush=True)
            product_clip(slug, e["accent"], dark=dark)
            rendered += 1

        # The hero is a band of every case, so it only needs rebuilding when the
        # set changed. Without this a code-only push pays three minutes to
        # re-render a video identical to the one already published.
        hero = os.path.join(out_dir, "hero.mp4")
        newest = max(
            (os.path.getmtime(os.path.join(CASES, f"{e['slug']}.png")) for e in entries),
            default=0,
        )
        if not rendered and os.path.exists(hero) and os.path.getmtime(hero) >= newest:
            print(f"  hero  {label} — up to date", flush=True)
            continue

        print(f"  hero  {label}", flush=True)
        hero_clip(dark=dark)


# ------------------------------------------------------------------------ main

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"

    if what in ("all", "images"):
        print("stills")
        build_images(force="--force" in sys.argv)
    if what in ("all", "video"):
        print("video")
        build_video(only=[a for a in sys.argv[2:] if not a.startswith("-")] or None)

    print("done")
