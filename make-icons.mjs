/**
 * Regenerates the PNG app icons from the same vector art as icon.svg.
 *
 *   node make-icons.mjs
 *
 * Why a hand-rolled rasteriser instead of sharp/canvas/ImageMagick: Wired ships
 * with zero dependencies and no build step (see README, "Dependencies"), and a
 * four-shape flat icon does not justify breaking that. Node's zlib is the only
 * thing here that isn't arithmetic.
 *
 * The art is duplicated from icon.svg rather than parsed out of it — a general
 * SVG parser would be far more code than the icon is worth. If icon.svg's art
 * changes, change BOLT/BG/EDGE/GOLD below to match; build.js asserts the
 * two agree on the path and the palette, so they cannot drift silently.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, crc32 } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "icons");

/* ------------------------------ the art ---------------------------------- */

export const BOLT = "M56 12 L28 56 H46 L40 90 L74 42 H54 Z";
export const BG = "#0a0e17";
export const EDGE = "#24344a";
export const GOLD = "#f5b942";

/** The bolt path above, as the polygon it actually is. */
const BOLT_POINTS = [
  [56, 12], [28, 56], [46, 56], [40, 90], [74, 42], [54, 42],
];

/* --------------------------- geometry helpers ----------------------------- */

function inRoundedRect(x, y, rx0, ry0, w, h, r) {
  const x1 = rx0 + w, y1 = ry0 + h;
  if (x < rx0 || x > x1 || y < ry0 || y > y1) return false;
  // Outside the corner boxes it is a plain rectangle test.
  const cx = x < rx0 + r ? rx0 + r : x > x1 - r ? x1 - r : x;
  const cy = y < ry0 + r ? ry0 + r : y > y1 - r ? y1 - r : y;
  if (cx === x || cy === y) return true;
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function inPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function scaleAboutCentre(pts, k) {
  return pts.map(([x, y]) => [50 + (x - 50) * k, 50 + (y - 50) * k]);
}

const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/* ------------------------------- variants --------------------------------- */

// Three variants, not one image resized three ways.
//
//  standard — icon.svg verbatim: rounded corners, hairline border, transparent
//             outside the rounding.
//  maskable — Android crops maskable icons to a circle of radius 40 (of 100).
//             The stock bolt's lower tip sits at r≈41 and the rounded corners
//             would be eaten entirely, so this is full-bleed with the bolt at
//             78% about the centre, putting its furthest point at r≈32.
//  apple    — iOS applies its own rounded mask and ignores transparency, so a
//             full-bleed square background is what avoids black corners.
const BOLT_MASKABLE = scaleAboutCentre(BOLT_POINTS, 0.78);

function sampler(variant) {
  const bg = rgb(BG), edge = rgb(EDGE), gold = rgb(GOLD);
  return (x, y) => {
    if (variant === "standard") {
      if (inPolygon(x, y, BOLT_POINTS)) return gold;
      // The 2px stroke on a rect inset by 2 straddles inset 1 to inset 3.
      const outer = inRoundedRect(x, y, 1, 1, 98, 98, 19);
      const inner = inRoundedRect(x, y, 3, 3, 94, 94, 17);
      if (outer && !inner) return edge;
      if (inRoundedRect(x, y, 0, 0, 100, 100, 20)) return bg;
      return null; // transparent
    }
    const pts = variant === "maskable" ? BOLT_MASKABLE : BOLT_POINTS;
    if (inPolygon(x, y, pts)) return gold;
    return bg; // full bleed
  };
}

/* ------------------------------ rasteriser -------------------------------- */

const SS = 4; // supersampling factor per axis — 16 samples/pixel

function raster(variant, size) {
  const sample = sampler(variant);
  const px = Buffer.alloc(size * size * 4);
  const step = 100 / size / SS;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const ux = (x * SS + sx + 0.5) * step;
          const uy = (y * SS + sy + 0.5) * step;
          const c = sample(ux, uy);
          if (c) { r += c[0]; g += c[1]; b += c[2]; a += 1; }
        }
      }
      const n = SS * SS;
      const o = (y * size + x) * 4;
      // Averaged over covered samples only, so edges blend toward the shape's
      // own colour rather than toward black.
      px[o] = a ? Math.round(r / a) : 0;
      px[o + 1] = a ? Math.round(g / a) : 0;
      px[o + 2] = a ? Math.round(b / a) : 0;
      px[o + 3] = Math.round((a / n) * 255);
    }
  }
  return px;
}

/* ------------------------------ PNG writer -------------------------------- */

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

function png(px, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type: RGBA
  // 10,11,12 = compression/filter/interlace, all 0

  // Filter type 0 (None) on every scanline: the art is flat colour, so the
  // adaptive filters buy almost nothing and cost clarity here.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* --------------------------------- main ----------------------------------- */

export const ICONS = [
  ["icon-192.png", "standard", 192],
  ["icon-512.png", "standard", 512],
  ["maskable-512.png", "maskable", 512],
  ["apple-touch-icon-180.png", "apple", 180],
];

if (process.argv[1] && process.argv[1].endsWith("make-icons.mjs")) {
  mkdirSync(OUT, { recursive: true });
  for (const [name, variant, size] of ICONS) {
    const buf = png(raster(variant, size), size);
    writeFileSync(join(OUT, name), buf);
    console.log(`  ${name.padEnd(26)} ${size}×${size}  ${buf.length} bytes`);
  }
  console.log(`\nWrote ${ICONS.length} icons to icons/.`);
  console.log("Remember to bump CACHE_NAME in sw.js if the set changed.");
}
