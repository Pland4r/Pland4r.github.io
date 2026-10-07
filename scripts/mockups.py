#!/usr/bin/env python3
"""
MA Cases — staged mockups.

The supplier photo of a case is one flat shot on white: true to the product,
and dull. This stages that same photo five ways, so the shop has something to
post that is not fourteen copies of the same frame.

    social/mockups/<slug>-studio.jpg   1080x1350  straight on, grey sweep
    social/mockups/<slug>-angle.jpg    1080x1350  turned, the side of the shell
    social/mockups/<slug>-macro.jpg    1080x1350  close on the camera corner
    social/mockups/<slug>-night.jpg    1080x1350  dark stage, lit by its colour
    social/mockups/<slug>-flat.jpg     1350x1080  laid down, seen from above

Nothing is invented about the product. The print, the shell colour and the
cut-outs are the photo's own pixels. The side of the case is built rather than
copied — a photographed rim is mostly the studio's own highlight, and smearing
it sideways gives a grey blade instead of a shell — but it is built out of the
case's measurements: its own shell colour, and buttons at the rows where the
photo actually has them. What is added is the room: backdrop, light, shadow,
reflection. A case never appears in a colour, or with a button, that the real
one does not have, which is the same rule the site follows.

Everything is drawn at twice the finished size and set down once, so warps,
rotations and cut edges are resolved before the picture is made.

Usage
    python scripts/mockups.py                      # every case, every scene
    python scripts/mockups.py porsche-911-brabus   # one case
    python scripts/mockups.py --scene night        # one scene, every case

Requires: pillow, numpy, scipy.
"""

from __future__ import annotations

import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from assets import SRC, accent_of, clean_cutout, cutout, discover, shell_of  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "social", "mockups")

SCENES = ("studio", "angle", "macro", "night", "flat")

SS = 2  # supersample: draw at 2x, resolve down to the finished size

# How the light falls across the side of a shell, front edge to back edge.
# `roll` is the bright turn where the back of the case rounds into its side,
# `edge` the thinner one where the side rounds in toward the phone.
DAY = {"front": 1.02, "back": 0.58, "roll": 0.13, "edge": 0.1}
DUSK = {"front": 0.7, "back": 0.28, "roll": 0.18, "edge": 0.16}


# ------------------------------------------------------------------ raster bits

def _arr(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert("RGBA")).astype(np.float32)


def _im(a: np.ndarray) -> Image.Image:
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")


def _hex_rgb(value: str) -> tuple[float, float, float]:
    value = value.lstrip("#")
    return tuple(float(int(value[i:i + 2], 16)) for i in (0, 2, 4))


def _over(top: np.ndarray, bottom: np.ndarray) -> np.ndarray:
    """Source-over, done on straight alpha so nothing picks up a dark fringe."""
    ta = top[:, :, 3:4] / 255.0
    ba = bottom[:, :, 3:4] / 255.0
    oa = ta + ba * (1.0 - ta)
    out = np.empty_like(bottom)
    out[:, :, :3] = (top[:, :, :3] * ta + bottom[:, :, :3] * ba * (1.0 - ta)) / np.maximum(oa, 1e-6)
    out[:, :, 3:4] = oa * 255.0
    return out


def _premul(a: np.ndarray) -> np.ndarray:
    p = a.copy()
    p[:, :, :3] *= p[:, :, 3:4] / 255.0
    return p


def _unpremul(p: np.ndarray) -> np.ndarray:
    out = p.copy()
    out[:, :, :3] = np.clip(out[:, :, :3] * 255.0 / np.maximum(out[:, :, 3:4], 1.0), 0, 255)
    return out


def _down(a: np.ndarray, factor: int = SS) -> np.ndarray:
    """
    Resolve the oversized drawing down to its finished size.

    Premultiplied, because a plain resample mixes the colour of pixels that are
    not there into the ones that are, and the case comes back with a dark seam
    all the way round it.
    """
    h, w = a.shape[:2]
    small = _im(_premul(a)).resize((w // factor, h // factor), Image.LANCZOS)
    return _unpremul(_arr(small))


def _rotate(a: np.ndarray, angle: float) -> np.ndarray:
    return _unpremul(_arr(_im(_premul(a)).rotate(angle, Image.BICUBIC)))


def _shift(a: np.ndarray, ox: int, oy: int) -> np.ndarray:
    out = np.zeros_like(a)
    h, w = a.shape[:2]
    sy0, sy1 = max(0, -oy), min(h, h - oy)
    sx0, sx1 = max(0, -ox), min(w, w - ox)
    if sy1 > sy0 and sx1 > sx0:
        out[sy0 + oy:sy1 + oy, sx0 + ox:sx1 + ox] = a[sy0:sy1, sx0:sx1]
    return out


def _bbox(alpha: np.ndarray, thr: float = 6.0) -> tuple[int, int, int, int]:
    ys, xs = np.where(alpha > thr)
    if len(xs) == 0:
        return 0, 0, alpha.shape[1], alpha.shape[0]
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def _mask_blur(m: np.ndarray, radius: float) -> np.ndarray:
    im = Image.fromarray(np.clip(m, 0, 255).astype(np.uint8), "L")
    return np.asarray(im.filter(ImageFilter.GaussianBlur(radius))).astype(np.float32)


def _bleed(im: Image.Image) -> Image.Image:
    """
    Push the shell colour out past the cut edge before warping.

    A perspective resample reads neighbours, and outside the cut-out the
    neighbours are transparent black. Filling them with the nearest real pixel
    first means the warp has something honest to interpolate, so the case keeps
    a clean edge instead of a grey outline.
    """
    a = _arr(im)
    hole = a[:, :, 3] < 250
    if hole.any() and (~hole).any():
        idx = ndimage.distance_transform_edt(hole, return_distances=False, return_indices=True)
        a[:, :, :3] = a[:, :, :3][idx[0], idx[1]]
    return _im(a)


def _warp(im: Image.Image, size: tuple[int, int], quad) -> Image.Image:
    """
    Map the picture's corners onto `quad` — clockwise from the top left.

    The result is cut to the quad afterwards. A projective map sends everything
    past its own horizon back into the picture, so without that cut a second,
    mirrored case appears somewhere off the end of the real one.
    """
    w, h = im.size
    src = [(0.0, 0.0), (w, 0.0), (w, h), (0.0, h)]
    rows, rhs = [], []
    for (dx, dy), (sx, sy) in zip(quad, src):
        rows.append([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy])
        rhs.append(sx)
        rows.append([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy])
        rhs.append(sy)
    coeffs = np.linalg.solve(np.array(rows, float), np.array(rhs, float))
    out = _arr(im.transform(size, Image.PERSPECTIVE, tuple(coeffs), Image.BICUBIC))

    cx = sum(p[0] for p in quad) / 4.0
    cy = sum(p[1] for p in quad) / 4.0
    keep = Image.new("L", size, 0)
    ImageDraw.Draw(keep).polygon(
        [(x + math.copysign(1.5, x - cx), y + math.copysign(1.5, y - cy)) for x, y in quad],
        fill=255)
    out[:, :, 3] *= _mask_blur(np.asarray(keep).astype(np.float32), 1.1) / 255.0
    return _im(out)


def _reach(alpha: np.ndarray, dx: float, dy: float) -> np.ndarray:
    """
    The ground the face covers as it is pushed back along (dx, dy).

    The side is a clean trapezoid; the shell it grows out of has rounded
    corners. Clipping one to the other is what keeps those corners round
    instead of leaving a square flap hanging off the end of the case.
    """
    steps = int(min(56, max(4, math.hypot(dx, dy) / 2.0)))
    out = alpha
    for i in range(1, steps + 1):
        t = i / steps
        out = np.maximum(out, _shift(alpha[:, :, None], int(round(dx * t)),
                                     int(round(dy * t)))[:, :, 0])
    return out


# ------------------------------------------------------------- the case itself

def _tight(case: Image.Image) -> Image.Image:
    """
    Crop to the shell itself.

    The cut-out leaves a few transparent pixels around the case, which is right
    for a card on a web page and wrong here: the face is warped to the edge of
    its box and the side starts from that same edge, so any margin opens a slot
    of daylight between the two.
    """
    return case.crop(_bbox(_arr(case)[:, :, 3], 2.0))


def _presses(case: Image.Image) -> np.ndarray:
    """
    Where this case has buttons down its right-hand edge, row by row.

    Read off the photo rather than assumed: a button is a run of rows that is
    markedly darker than the rest of that edge. Judging it against the edge's
    own median is what lets the same test work on a white shell and a black
    one — on a black one nothing stands out, and the side comes back plain,
    which is what the real case looks like.
    """
    a = _arr(case)
    h, w = a.shape[:2]
    win = max(3, int(w * 0.05))
    edge = a[:, w - win:w, :3].mean(axis=2)
    solid = a[:, w - win:w, 3].max(axis=1) > 128
    rim = edge.min(axis=1)

    if solid.sum() < 16:
        return np.zeros(h, np.float32)
    base = float(np.median(rim[solid]))
    press = np.clip((base * 0.72 - rim) / max(base * 0.30, 16.0), 0, 1)
    press[~solid] = 0.0
    return ndimage.gaussian_filter1d(press.astype(np.float32), max(1.0, h * 0.0025))


def _side(case: Image.Image, shell, depth: int, height: int, look, hidden: float) -> Image.Image:
    """
    The side wall of the shell, as a flat strip to be turned into place.

    Columns run from the edge nearest the camera to the one furthest; `hidden`
    is the fraction at the front that will end up tucked under the face, so the
    bright turn of the shell lands just where the two meet rather than behind
    it. The buttons sit in a well, slightly in from both edges, at the rows
    `_presses` found.
    """
    depth = max(8, int(depth))
    height = max(16, int(height))
    t = np.linspace(0.0, 1.0, depth, dtype=np.float32)[None, :]
    u = np.clip((t - hidden) / max(1e-3, 1.0 - hidden), 0.0, 1.0)

    lit = look["front"] + (look["back"] - look["front"]) * u ** 0.85
    lit += look["roll"] * np.exp(-((u - 0.09) / 0.11) ** 2)
    lit += look["edge"] * np.exp(-((u - 0.96) / 0.06) ** 2)
    body = np.array(shell, np.float32)[None, None, :] * lit[:, :, None]

    press = _presses(case)
    press = np.interp(np.linspace(0, len(press) - 1, height),
                      np.arange(len(press)), press).astype(np.float32)[:, None]

    # A button is a pill, not a bar: where the run of dark rows is fading out
    # the shape has to narrow across the side as well, or it ends in a corner
    # no moulded button has.
    across = (np.abs(u - 0.5) / 0.33) ** 2
    button = np.clip((press - across) * 2.4, 0, 1)
    well = np.clip((press - across * 0.55) * 2.4, 0, 1)

    out = np.broadcast_to(body, (height, depth, 3)).copy()
    out *= (1.0 - 0.26 * np.clip(well - button, 0, 1))[:, :, None]  # the recess it sits in
    dark = np.array([36.0, 36.0, 40.0], np.float32)
    dark = dark + 26.0 * np.exp(-((u - 0.34) / 0.12) ** 2)[:, :, None]    # sheen on the button
    out = out * (1.0 - button[:, :, None]) + dark * button[:, :, None]

    # Let the side die away at the two ends, and let the back of it die away
    # first. A shell's corner is rounded in both directions, so the wall wraps
    # and narrows there; carried straight to the end it leaves a flat tongue
    # sticking out past the corner.
    rows = np.arange(height, dtype=np.float32)
    ends = np.clip(np.minimum(rows, height - 1 - rows) / max(height * 0.05, 1.0), 0, 1)
    alpha = 255.0 * ends[:, None] ** (0.4 + 1.8 * u)

    strip = np.empty((height, depth, 4), np.float32)
    strip[:, :, :3] = out
    strip[:, :, 3] = alpha
    return _im(strip)


def _turned(case: Image.Image, size, box, shell, lean: float = 0.15, rise: float = 0.05,
            thick: float = 0.075, look=DAY) -> np.ndarray:
    """
    The case rotated a little on its own axis, inside `box`.

    The near edge is the right one: it keeps its full height while the far edge
    shortens and pulls in, and the side hangs off the near edge, which is the
    only one a rotation this way can show. The side's own corners lean back
    toward the far edge, so the top and bottom of the case close in the way a
    lens closes them rather than running parallel.
    """
    W, H = size
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    tl, tr = (x0 + w * lean, y0 + h * rise), (x1, y0)
    br, bl = (x1, y1), (x0 + w * lean, y1 - h * rise)

    # Shave the last hair off the near edge before warping. The photo's own cut
    # edge is darker than the shell — it is where the case stopped and the
    # studio's white began — and left in, it lands exactly on the join and
    # draws a dark line down it. Taken off, the bright turn of the side becomes
    # the crease instead, which is what the edge of a shell actually does.
    trim = max(2, int(case.width * 0.014))
    face = _arr(_warp(_bleed(case.crop((0, 0, case.width - trim, case.height))),
                      (W, H), [tl, tr, br, bl]))
    face[:, :, 3] = np.where(face[:, :, 3] > 20, face[:, :, 3], 0.0)

    ex, ey = w * thick, h * rise * 0.85
    tuck = max(3.0, w * 0.014)
    strip = _side(case, shell, ex + tuck, h, look, tuck / (ex + tuck))
    side = _arr(_warp(strip, (W, H),
                      [(tr[0] - tuck, tr[1]), (tr[0] + ex, tr[1] + ey),
                       (br[0] + ex, br[1] - ey), (br[0] - tuck, br[1])]))

    # Where the shell turns its corner it is rounded the other way too, and the
    # side it shows closes to nothing. Narrowing the face by the depth of the
    # side before carrying it back is what finds that: along the straight run of
    # the edge it changes nothing, and at the two ends it stops the side
    # reaching past the curve and leaving a tongue out in the open.
    a = face[:, :, 3]
    run = np.minimum(np.minimum(a, _shift(a[:, :, None], 0, int(ex))[:, :, 0]),
                     _shift(a[:, :, None], 0, -int(ex))[:, :, 0])
    side[:, :, 3] *= _reach(run, ex + tuck, 0) / 255.0
    return _over(face, side)


def _slope(layer: np.ndarray, toward, amount: float) -> np.ndarray:
    """The broad fall of light across the whole object, away from the lamp."""
    h, w = layer.shape[:2]
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (x / w) * toward[0] + (y / h) * toward[1]
    u = (u - u.min()) / max(u.max() - u.min(), 1e-6)
    layer[:, :, :3] *= (1.0 + amount * (0.5 - u))[:, :, None]
    return layer


def _form(layer: np.ndarray, light=(-0.55, -0.83), width: float = 9.0,
          lift: float = 0.4, dip: float = 0.3, colour=(255.0, 255.0, 255.0)) -> np.ndarray:
    """
    The turn of the shell at its outline, lit from one direction.

    A flat photo laid into a scene reads as a sticker because its edge is the
    one place a real case gives itself away: it curves, so the side facing the
    lamp catches a hard line of it and the side facing away loses it. This puts
    that line back, following the silhouette wherever the warp has left it.
    """
    a = layer[:, :, 3]
    solid = a > 128
    if not solid.any():
        return layer
    inner = ndimage.distance_transform_edt(solid).astype(np.float32)
    band = np.clip(1.0 - inner / max(width, 1.0), 0.0, 1.0) ** 1.6

    gy, gx = np.gradient(_mask_blur(a, max(2.0, width * 0.3)) / 255.0)
    n = np.sqrt(gx * gx + gy * gy) + 1e-6
    d = (-gx / n) * light[0] + (-gy / n) * light[1]

    hi = np.clip(d, 0, 1) * band * lift
    lo = np.clip(-d, 0, 1) * band * dip
    layer[:, :, :3] += (np.array(colour, np.float32)[None, None, :] - layer[:, :, :3]) \
        * hi[:, :, None]
    layer[:, :, :3] *= (1.0 - lo)[:, :, None]
    return layer


def _grounded(layer: np.ndarray, base_y: int, depth: float, strength: float = 0.3) -> np.ndarray:
    """Darken the case where it meets the floor — light cannot get in there."""
    h = layer.shape[0]
    y = np.arange(h, dtype=np.float32)[:, None]
    m = np.clip(1.0 - (base_y - y) / max(depth, 1.0), 0, 1) ** 2 * strength
    layer[:, :, :3] *= (1.0 - m)[:, :, None]
    return layer


def _defocus(layer: np.ndarray, focus: float, falloff: float, radius: float) -> np.ndarray:
    """Let the frame fall out of focus away from one line, the way a lens does."""
    p = _premul(layer)
    soft = _arr(_im(p).filter(ImageFilter.GaussianBlur(radius)))
    y = np.arange(layer.shape[0], dtype=np.float32)[:, None, None]
    m = np.clip(np.abs(y - focus) / max(falloff, 1.0), 0, 1) ** 1.6
    return _unpremul(p * (1.0 - m) + soft * m)


# --------------------------------------------------------------------- the room

def _sweep(w: int, h: int, stops) -> np.ndarray:
    """A seamless backdrop: colours pinned at fractions of the height."""
    ys = np.arange(h, dtype=np.float32) / max(h - 1, 1)
    cols = np.zeros((h, 3), np.float32)
    pts = sorted(stops)
    cols[:] = np.array(pts[0][1], np.float32)
    for (y0, c0), (y1, c1) in zip(pts, pts[1:]):
        m = (ys >= y0) & (ys <= y1)
        if m.any():
            t = ((ys[m] - y0) / max(y1 - y0, 1e-6))[:, None]
            t = t * t * (3.0 - 2.0 * t)  # ease, so no stop shows as a line
            cols[m] = np.array(c0, np.float32) * (1 - t) + np.array(c1, np.float32) * t
    cols[ys > pts[-1][0]] = np.array(pts[-1][1], np.float32)
    out = np.zeros((h, w, 4), np.float32)
    out[:, :, :3] = cols[:, None, :]
    out[:, :, 3] = 255.0
    return out


def _pool(a: np.ndarray, cx: float, cy: float, radius: float, colour, strength: float,
          squash: float = 1.0) -> np.ndarray:
    """A soft pool of light: the lamp behind the case, or its fall on the desk."""
    h, w = a.shape[:2]
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt((x - cx) ** 2 + ((y - cy) / max(squash, 1e-3)) ** 2) / radius
    m = np.clip(1.0 - d, 0, 1) ** 2 * strength
    a[:, :, :3] += (np.array(colour, np.float32)[None, None, :] - a[:, :, :3]) * m[:, :, None]
    return a


def _bokeh(a: np.ndarray, colour, spots: int, radius: float, strength: float,
           band=(0.0, 0.6), seed: int = 3) -> np.ndarray:
    """Whatever else is in the room, far enough back to be only light."""
    rng = np.random.default_rng(seed)
    h, w = a.shape[:2]
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    for _ in range(spots):
        cx, cy = rng.uniform(-0.1, 1.1) * w, rng.uniform(*band) * h
        r = radius * rng.uniform(0.45, 1.5)
        m = np.clip(1.0 - np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r, 0, 1) ** 0.4
        m *= strength * rng.uniform(0.35, 1.0)
        a[:, :, :3] += (np.array(colour, np.float32)[None, None, :] - a[:, :, :3]) * m[:, :, None]
    return a


def _weave(a: np.ndarray, y0: float, strength: float = 6.0) -> np.ndarray:
    """The weave on the dark surface — fine, crossed, and barely there."""
    h, w = a.shape[:2]
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    pattern = np.sin((x + y) * 0.42) * np.sin((x - y) * 0.42)
    band = np.clip((y / h - y0) / max(1e-6, 1 - y0), 0, 1) ** 0.6
    a[:, :, :3] += (pattern * band * strength)[:, :, None]
    return a


def _floor_shadow(bg: np.ndarray, alpha: np.ndarray, base_y: int, lean: int = 0) -> np.ndarray:
    """
    Three shadows, not one.

    A single blur reads as a smudge. What sells the case as standing on
    something is the hard, nearly black line right where it touches, the body
    of the shadow just behind it, and a wide soft one that does nothing but
    close the gap to the backdrop.
    """
    h, w = alpha.shape
    x0, y0, x1, y1 = _bbox(alpha)
    cw, chh = x1 - x0, y1 - y0
    sil = Image.fromarray(np.clip(alpha[y0:y1, x0:x1], 0, 255).astype(np.uint8), "L")

    for squash, blur, strength, spread, slide in (
            (0.016, 4.0, 0.58, 0.985, 0.0),
            (0.055, 18.0, 0.36, 1.03, 0.35),
            (0.170, 56.0, 0.20, 1.14, 1.0)):
        nw, nh = max(2, int(cw * spread)), max(2, int(chh * squash))
        pad = Image.new("L", (w, h), 0)
        pad.paste(sil.resize((nw, nh), Image.LANCZOS),
                  (x0 - (nw - cw) // 2 + int(lean * slide), base_y - nh // 2))
        s = _mask_blur(np.asarray(pad).astype(np.float32), blur) / 255.0 * strength
        bg[:, :, :3] *= (1.0 - s)[:, :, None]
    return bg


def _reflect(bg: np.ndarray, layer: np.ndarray, squash: float = 0.46,
             opacity: float = 0.2, fade: float = 0.42, blur: float = 2.5) -> np.ndarray:
    """The floor is polished, so a little of the case comes back up out of it."""
    h, w = bg.shape[:2]
    x0, y0, x1, y1 = _bbox(layer[:, :, 3])
    ph = max(2, int((y1 - y0) * squash))
    piece = _im(layer[y0:y1, x0:x1]).transpose(Image.FLIP_TOP_BOTTOM)
    p = _arr(piece.resize((x1 - x0, ph), Image.LANCZOS))
    ramp = np.clip(1.0 - np.arange(ph, dtype=np.float32) / max(ph * fade, 1.0), 0, 1) ** 1.7
    p[:, :, 3] *= ramp[:, None] * opacity
    p[:, :, 3] = _mask_blur(p[:, :, 3], blur)

    canvas = np.zeros_like(bg)
    ey, ex = min(h, y1 + ph), min(w, x1)
    if ey > y1 and ex > x0:
        canvas[y1:ey, x0:ex] = p[:ey - y1, :ex - x0]
    return _over(canvas, bg)


def _rim(layer: np.ndarray, colour, ox: int, oy: int, strength: float = 0.5,
         blur: float = 4.0, grow: int = 3) -> np.ndarray:
    """A coloured edge light, so the case separates from a dark stage."""
    solid = layer[:, :, 3] > 128
    ring = (ndimage.binary_dilation(solid, iterations=grow) & ~solid).astype(np.float32) * 255.0
    ring = _mask_blur(_shift(ring[:, :, None], ox, oy)[:, :, 0], blur)
    glow = np.zeros_like(layer)
    glow[:, :, :3] = np.array(colour, np.float32)[None, None, :]
    glow[:, :, 3] = np.clip(ring * strength, 0, 255)
    return _over(layer, glow)


def _finish(a: np.ndarray, grain: float = 1.7, vignette: float = 0.16,
            sharpen: int = 46, contrast: float = 0.2, seed: int = 7) -> Image.Image:
    h, w = a.shape[:2]
    rgb = np.clip(a[:, :, :3], 0, 255) / 255.0
    # A gentle S-curve: it holds black and white where they are and puts the
    # bite back into everything between them.
    rgb = np.clip(rgb + contrast * (rgb - 0.5) * (1.0 - np.abs(2.0 * rgb - 1.0)), 0, 1)
    grey = rgb.mean(axis=2, keepdims=True)
    rgb = np.clip(grey + (rgb - grey) * 1.06, 0, 1) * 255.0

    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2)
    rgb *= (1.0 - vignette * np.clip((r - 0.5) / 0.9, 0, 1) ** 2)[:, :, None]

    out = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
    if sharpen:
        out = out.filter(ImageFilter.UnsharpMask(radius=1.1, percent=sharpen, threshold=3))
    # Grain last, which also dithers the gradients off their banding.
    n = np.random.default_rng(seed).normal(0, grain, (h, w, 1))
    return Image.fromarray(
        np.clip(np.asarray(out).astype(np.float32) + n, 0, 255).astype(np.uint8), "RGB")


def _fit(case: Image.Image, height: int) -> Image.Image:
    w, h = case.size
    return case.resize((max(1, int(round(w * height / h))), int(height)), Image.LANCZOS)


# ----------------------------------------------------------------- the scenes

def studio(case: Image.Image, shell, accent) -> Image.Image:
    """Straight on, lit from the front, standing on a grey sweep."""
    W, H = 1080, 1350
    w, h = W * SS, H * SS

    ch = int(h * 0.78)
    fitted = _fit(case, ch)
    base = int(h * 0.905)
    layer = np.zeros((h, w, 4), np.float32)
    layer[base - ch:base, (w - fitted.width) // 2:(w - fitted.width) // 2 + fitted.width] = \
        _arr(fitted)
    layer = _form(layer, (-0.5, -0.86), 11.0 * SS, 0.34, 0.22)
    layer = _grounded(layer, base, h * 0.035, 0.26)
    layer = _down(layer)

    bg = _sweep(W, H, [(0.0, (240, 240, 243)), (0.42, (229, 230, 233)),
                       (0.70, (209, 210, 214)), (0.78, (214, 215, 219)),
                       (1.0, (234, 235, 238))])
    bg = _pool(bg, W * 0.5, H * 0.3, W * 0.95, (253, 253, 254), 0.32)
    bg = _floor_shadow(bg, layer[:, :, 3], base // SS + 3, -int(W * 0.035))
    bg = _reflect(bg, layer, 0.44, 0.17)
    return _finish(_over(layer, bg), 1.7, 0.15, 46, 0.2, 11)


def angle(case: Image.Image, shell, accent) -> Image.Image:
    """Three-quarters, so the thickness of the shell reads."""
    W, H = 1080, 1350
    w, h = W * SS, H * SS

    ch = int(h * 0.79)
    cw = int(round(case.width * ch / case.height))
    x0, y0 = int(w * 0.5 - cw * 0.56), int(h * 0.085)
    layer = _turned(case, (w, h), (x0, y0, x0 + cw, y0 + ch), _hex_rgb(shell),
                    0.16, 0.048, 0.078)
    layer = _form(layer, (-0.52, -0.85), 11.0 * SS, 0.34, 0.24)
    layer = _grounded(layer, y0 + ch, h * 0.035, 0.26)
    layer = _rotate(layer, -1.2)
    layer = _down(layer)

    bg = _sweep(W, H, [(0.0, (239, 239, 242)), (0.42, (227, 228, 231)),
                       (0.70, (206, 207, 211)), (0.78, (212, 213, 217)),
                       (1.0, (233, 234, 237))])
    bg = _pool(bg, W * 0.36, H * 0.26, W * 0.9, (253, 253, 254), 0.32)
    bg = _floor_shadow(bg, layer[:, :, 3], (y0 + ch) // SS + 4, -int(W * 0.04))
    bg = _reflect(bg, layer, 0.42, 0.16)
    return _finish(_over(layer, bg), 1.7, 0.16, 46, 0.2, 23)


def macro(case: Image.Image, shell, accent) -> Image.Image:
    """
    Close on the camera corner, where the shell is at its most convincing.

    The case runs off three sides of the frame, so what is left is cut-out,
    gloss and the first line of the print — the part a customer looks at to
    decide the thing is real. Away from the lenses the frame softens, because
    this close a lens cannot hold all of it.
    """
    W, H = 1080, 1350
    w, h = W * SS, H * SS

    cw = int(w * 1.2)
    ch = int(round(case.height * cw / case.width))
    x0, y0 = int(w * 0.015), int(h * 0.03)
    layer = _turned(case, (w, h), (x0, y0, x0 + cw, y0 + ch), _hex_rgb(shell),
                    0.1, 0.03, 0.05)
    layer = _form(layer, (-0.5, -0.86), 22.0 * SS, 0.19, 0.17)
    layer = _down(layer)
    layer = _defocus(layer, H * 0.34, H * 0.95, 3.4)

    bg = _sweep(W, H, [(0.0, (176, 177, 182)), (0.45, (142, 143, 148)), (1.0, (104, 105, 110))])
    bg = _pool(bg, W * 0.82, H * 0.14, W * 1.05, (212, 213, 217), 0.5)
    bg = _arr(_im(bg).filter(ImageFilter.GaussianBlur(30)))
    bg = _floor_shadow(bg, layer[:, :, 3], int(H * 1.02), -int(W * 0.05))
    return _finish(_over(layer, bg), 2.0, 0.22, 72, 0.22, 31)


def night(case: Image.Image, shell, accent) -> Image.Image:
    """
    A dark stage, with the only colour in the room coming off the case.

    The light here goes on the case, not around it. An outline that glows is
    the one thing that gives a composite away instantly; what a lamp behind a
    shell actually does is put a hard line of its own colour down the edge
    turned toward it, and leave the rest of the case to fall off into the dark.
    """
    W, H = 1080, 1350
    w, h = W * SS, H * SS
    tint = _hex_rgb(accent)
    hot = [min(255.0, c * 1.3 + 24) for c in tint]
    deep = [c * 0.5 + 12 for c in tint]

    ch = int(h * 0.72)
    cw = int(round(case.width * ch / case.height))
    x0, y0 = int(w * 0.5 - cw * 0.54), int(h * 0.125)
    layer = _turned(case, (w, h), (x0, y0, x0 + cw, y0 + ch), _hex_rgb(shell),
                    0.13, 0.044, 0.07, DUSK)
    lit = layer[:, :, 3] > 0
    layer[:, :, :3][lit] *= 0.8
    layer = _slope(layer, (0.78, 0.62), 0.42)
    layer = _form(layer, (-0.5, -0.86), 9.0 * SS, 0.2, 0.36)
    layer = _form(layer, (0.95, -0.3), 6.5 * SS, 0.62, 0.0, hot)
    layer = _grounded(layer, y0 + ch, h * 0.03, 0.45)
    layer = _rotate(layer, -2.0)
    layer = _down(layer)
    layer = _rim(layer, hot, -2, -1, 0.16, 5.0, 2)

    bg = _sweep(W, H, [(0.0, (24, 23, 27)), (0.5, (16, 15, 19)),
                       (0.70, (10, 9, 13)), (0.78, (18, 17, 22)), (1.0, (29, 28, 33))])
    bg = _bokeh(bg, deep, 5, W * 0.38, 0.24, (0.0, 0.42), 5)
    bg = _weave(bg, 0.72, 4.5)
    bg = _pool(bg, W * 0.52, H * 0.46, W * 0.6, tint, 0.3, 1.25)
    bg = _pool(bg, W * 0.1, H * 0.06, W * 0.5, deep, 0.16)
    bg = _floor_shadow(bg, layer[:, :, 3], (y0 + ch) // SS + 4, -int(W * 0.03))
    bg = _reflect(bg, layer, 0.5, 0.3, 0.52, 3.2)
    return _finish(_over(layer, bg), 2.2, 0.3, 44, 0.16, 47)


def flat(case: Image.Image, shell, accent) -> Image.Image:
    """
    Laid on a desk and seen from above, tilted off square.

    The far end of the case is further from the lens than the near end, so it
    is drawn shorter, and the side falls to the lower edge where the light from
    the window above does not reach it.
    """
    W, H = 1350, 1080
    bw, bh = int(W * 1.26) * SS, int(H * 1.52) * SS

    ch = int(H * 0.99) * SS
    cw = int(round(case.width * ch / case.height))
    x0, y0 = (bw - cw) // 2, (bh - ch) // 2
    layer = _turned(case, (bw, bh), (x0, y0, x0 + cw, y0 + ch), _hex_rgb(shell),
                    0.1, 0.038, 0.055)
    layer = _form(layer, (-0.42, -0.9), 12.0 * SS, 0.4, 0.3)
    layer = _rotate(layer, -46.0)
    layer = _down(layer)

    lay = layer[(bh // SS - H) // 2:(bh // SS - H) // 2 + H,
                (bw // SS - W) // 2:(bw // SS - W) // 2 + W].copy()

    bg = _sweep(W, H, [(0.0, (152, 153, 158)), (0.5, (132, 133, 138)), (1.0, (108, 109, 114))])
    bg = _pool(bg, W * 0.18, H * 0.06, W * 0.95, (204, 205, 210), 0.55)
    bg = _pool(bg, W * 0.95, H * 1.02, W * 0.65, (76, 77, 82), 0.45)

    # Lying down, the case casts rather than stands in its shadow.
    for ox, oy, blur, strength in ((int(W * 0.004), int(H * 0.006), 5.0, 0.4),
                                   (int(W * 0.018), int(H * 0.028), 22.0, 0.34),
                                   (int(W * 0.045), int(H * 0.07), 62.0, 0.2)):
        s = _mask_blur(_shift(lay[:, :, 3:], ox, oy)[:, :, 0], blur) / 255.0 * strength
        bg[:, :, :3] *= (1.0 - s)[:, :, None]
    return _finish(_over(lay, bg), 1.7, 0.2, 50, 0.2, 59)


RENDER = {"studio": studio, "angle": angle, "macro": macro, "night": night, "flat": flat}


# ------------------------------------------------------------------------ main

def build(only: list[str] | None = None, scenes: list[str] | None = None) -> None:
    os.makedirs(OUT, exist_ok=True)
    entries = [e for e in discover() if not only or e["slug"] in only]
    scenes = scenes or list(SCENES)

    if only:
        for slug in sorted(set(only) - {e["slug"] for e in entries}):
            print(f"  ? no case called {slug}")

    for entry in entries:
        slug = entry["slug"]
        case = clean_cutout(entry["clean"]) if entry["clean"] else cutout(
            os.path.join(SRC, entry["file"]))
        shell, _ = shell_of(case)
        accent = accent_of(case)
        case = _tight(case)
        for scene in scenes:
            path = os.path.join(OUT, f"{slug}-{scene}.jpg")
            RENDER[scene](case, shell, accent).save(
                path, quality=94, subsampling=0, optimize=True, progressive=True)
            print(f"  {os.path.relpath(path, ROOT)}")


if __name__ == "__main__":
    args = sys.argv[1:]
    scenes: list[str] = []
    slugs: list[str] = []
    i = 0
    while i < len(args):
        if args[i] in ("--scene", "-s") and i + 1 < len(args):
            scenes.append(args[i + 1])
            i += 2
        else:
            slugs.append(args[i])
            i += 1

    bad = [s for s in scenes if s not in SCENES]
    if bad:
        sys.exit(f"unknown scene {bad[0]} — pick from {', '.join(SCENES)}")

    build(slugs or None, scenes or None)
