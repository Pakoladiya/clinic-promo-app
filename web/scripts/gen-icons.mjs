/**
 * Generates PWA icons (192x192 and 512x512) as PNGs
 * using only Node built-ins — no canvas lib needed.
 * Writes valid minimal PNG files with the ClinicPromo brand mark.
 */

import { createWriteStream, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT   = join(__dir, '..', 'public', 'icons');
mkdirSync(OUT, { recursive: true });

/* ── Tiny PNG encoder (no deps) ─────────────────────── */
import { deflateSync } from 'zlib';

function crc32(buf) {
  let c = 0xffffffff;
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let v = i;
    for (let j = 0; j < 8; j++) v = (v & 1) ? 0xedb88320 ^ (v >>> 1) : v >>> 1;
    t[i] = v;
  }
  for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t   = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function encodePNG(width, height, rgba) {
  // Filter byte 0 (None) per row
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]     = rgba[src];
      raw[dst + 1] = rgba[src + 1];
      raw[dst + 2] = rgba[src + 2];
      raw[dst + 3] = rgba[src + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // bit depth, RGBA

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG sig
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ── Draw icon ───────────────────────────────────────── */
function drawIcon(size) {
  const buf = new Uint8Array(size * size * 4);

  const cx = size / 2, cy = size / 2, r = size / 2;
  const brand = [0x1a, 0x73, 0xe8, 0xff]; // #1a73e8

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const i  = (y * size + x) * 4;

      if (dx * dx + dy * dy <= r * r) {
        // Circle background
        buf[i]   = brand[0];
        buf[i+1] = brand[1];
        buf[i+2] = brand[2];
        buf[i+3] = 255;
      }
      // else transparent
    }
  }

  // Draw a simple document + plus mark in white
  const s   = size / 10;          // stroke unit
  const wh  = [255, 255, 255, 255];

  // Document body
  fillRect(buf, size, cx - 2*s, cy - 3*s, 4*s, 5.5*s, wh);
  // Horizontal line on doc (remove a notch for dog-ear)
  fillRect(buf, size, cx + 0*s, cy - 3*s, 2*s, 2*s, brand);
  // Dog-ear triangle approximation
  fillRect(buf, size, cx + 0*s, cy - 3*s, 2*s, 2*s, [0xff, 0xff, 0xff, 0x60]);

  // Plus symbol
  fillRect(buf, size, cx - 0.6*s, cy - 1.6*s, 1.2*s, 3.2*s, brand);
  fillRect(buf, size, cx - 1.6*s, cy - 0.6*s, 3.2*s, 1.2*s, brand);

  return Buffer.from(buf.buffer);
}

function fillRect(buf, size, x0, y0, w, h, color) {
  for (let y = Math.round(y0); y < Math.round(y0 + h); y++) {
    for (let x = Math.round(x0); x < Math.round(x0 + w); x++) {
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      const i = (y * size + x) * 4;
      buf[i]   = color[0];
      buf[i+1] = color[1];
      buf[i+2] = color[2];
      buf[i+3] = color[3] ?? 255;
    }
  }
}

/* ── Generate + write ────────────────────────────────── */
for (const size of [192, 512]) {
  const rgba = drawIcon(size);
  const png  = encodePNG(size, size, rgba);
  const path = join(OUT, `icon-${size}.png`);
  createWriteStream(path).end(png);
  console.log(`✓ ${path} (${png.length} bytes)`);
}
