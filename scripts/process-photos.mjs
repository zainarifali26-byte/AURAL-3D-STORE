// Processes the source photos listed in photo-manifest.mjs into
// public/images/photos/*.webp using headless Chrome's canvas (no extra
// image dependencies).
//
//   node scripts/process-photos.mjs <folder with downloaded originals>
//
// The folder must contain <pexelsId>.jpg files (download them from the
// PEXELS_URL in the manifest). Originals are not committed to the repo.
import puppeteer from 'puppeteer-core';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHOTOS } from './photo-manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = process.argv[2];
if (!srcDir || !existsSync(srcDir)) {
  console.error('Usage: node scripts/process-photos.mjs <folder with <pexelsId>.jpg originals>');
  process.exit(1);
}
const outDir = path.join(root, 'public', 'images', 'photos');
await mkdir(outDir, { recursive: true });

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));

const backdropSrc = await readFile(path.join(root, 'scripts', 'backdrop.js'), 'utf8');

const browser = await puppeteer.launch({ executablePath, headless: true });
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
await page.addScriptTag({ content: backdropSrc.replace('export function', 'window.paintBackdrop = function') });

const SIZES = { portrait: [1600, 2000], wide: [1800, 1125] };

for (const p of PHOTOS) {
  const file = path.join(srcDir, `${p.pexels}.jpg`);
  const dataUrl = `data:image/jpeg;base64,${(await readFile(file)).toString('base64')}`;
  const [W, H] = SIZES[p.size];
  const result = await page.evaluate(
    async ({ dataUrl, crop, mode, W, H, cutout }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const [cx, cy, cw, ch] = crop;
      const sx = img.width * cx;
      const sy = img.height * cy;
      const sw = img.width * cw;
      const sh = img.height * ch;

      // Draw the crop, scaled to cover W x H.
      const src = document.createElement('canvas');
      src.width = W;
      src.height = H;
      const sctx = src.getContext('2d');
      sctx.imageSmoothingQuality = 'high';
      const scale = Math.max(W / sw, H / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      sctx.drawImage(img, sx, sy, sw, sh, (W - dw) / 2, (H - dh) / 2, dw, dh);

      const out = document.createElement('canvas');
      out.width = W;
      out.height = H;
      const octx = out.getContext('2d');
      let cut = null;

      if (mode === 'photo') {
        octx.drawImage(src, 0, 0);
      } else if (mode === 'plate') {
        window.paintBackdrop(octx, W, H);
        octx.globalCompositeOperation = 'multiply';
        octx.drawImage(src, 0, 0);
        octx.globalCompositeOperation = 'source-over';
      } else {
        // Chroma/luma key: estimate the backdrop colour from the corners,
        // derive alpha from distance to it, unmix the backdrop and despill.
        const data = sctx.getImageData(0, 0, W, H);
        const px = data.data;
        const sample = (x, y) => {
          const i = (Math.floor(y) * W + Math.floor(x)) * 4;
          return [px[i], px[i + 1], px[i + 2]];
        };
        const corners = [
          sample(8, 8),
          sample(W - 9, 8),
          sample(8, H - 9),
          sample(W - 9, H - 9),
          sample(W / 2, 8),
          sample(W / 2, H - 9),
        ];
        const bg = [0, 1, 2].map((k) => corners.reduce((s, c) => s + c[k], 0) / corners.length);
        const yellow = mode === 'key-yellow';
        // Pass 1: raw alpha per pixel.
        const alpha = new Float32Array(W * H);
        for (let i = 0, j = 0; i < px.length; i += 4, j++) {
          const r = px[i];
          const g = px[i + 1];
          const b = px[i + 2];
          if (yellow) {
            const d = Math.hypot((r - bg[0]) * 0.8, (g - bg[1]) * 1.0, (b - bg[2]) * 1.6);
            const max = Math.max(r, g, b);
            const sat = max ? (max - Math.min(r, g, b)) / max : 0;
            // Pale, unsaturated pixels are glare on the paper backdrop, not product.
            const glare = 0.299 * r + 0.587 * g + 0.114 * b > 170 && sat < 0.3;
            alpha[j] = glare ? 0 : Math.min(1, Math.max(0, (d - 70) / 130));
          } else {
            const lumBg = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            alpha[j] = Math.min(1, Math.max(0, (lumBg - lum - 6) / (lumBg - 50)));
          }
        }
        // Pass 2: separable box blurs. A narrow one for edges and a wide one for
        // soft shadows, which otherwise inherit the backdrop's paper texture.
        const boxBlur = (input, R) => {
          const tmp = new Float32Array(W * H);
          const outA = new Float32Array(W * H);
          for (let y = 0; y < H; y++) {
            let s = 0;
            for (let x = -R; x <= R; x++) s += input[y * W + Math.min(W - 1, Math.max(0, x))];
            for (let x = 0; x < W; x++) {
              tmp[y * W + x] = s / (2 * R + 1);
              s += input[y * W + Math.min(W - 1, x + R + 1)] - input[y * W + Math.max(0, x - R)];
            }
          }
          for (let x = 0; x < W; x++) {
            let s = 0;
            for (let y = -R; y <= R; y++) s += tmp[Math.min(H - 1, Math.max(0, y)) * W + x];
            for (let y = 0; y < H; y++) {
              outA[y * W + x] = s / (2 * R + 1);
              s += tmp[Math.min(H - 1, y + R + 1) * W + x] - tmp[Math.max(0, y - R) * W + x];
            }
          }
          return outA;
        };
        const narrow = boxBlur(alpha, 2);
        const wide = boxBlur(alpha, 14);
        const blurred = new Float32Array(W * H);
        for (let j = 0; j < W * H; j++) {
          const raw = alpha[j];
          if (raw > 0.9) blurred[j] = raw; // solid product: keep crisp
          else if (narrow[j] > 0.55) blurred[j] = narrow[j]; // product edge
          else blurred[j] = wide[j] < 0.06 ? 0 : Math.min(narrow[j], wide[j] * 0.9); // soft shadow
        }
        for (let i = 0, j = 0; i < px.length; i += 4, j++) {
          const r = px[i];
          const g = px[i + 1];
          const b = px[i + 2];
          // Yellow: distance from the backdrop, weighted toward blue (yellow has
          // almost none; the product and shadows do). White: luminance below it.
          const a = blurred[j];
          if (a <= 0.002) {
            px[i + 3] = 0;
            continue;
          }
          // Unmix: colour = (pixel - (1 - a) * bg) / a, then pull toward grey to remove spill.
          let nr = (r - (1 - a) * bg[0]) / a;
          let ng = (g - (1 - a) * bg[1]) / a;
          let nb = (b - (1 - a) * bg[2]) / a;
          const grey = 0.299 * nr + 0.587 * ng + 0.114 * nb;
          const spill = yellow ? Math.max(0, 1 - a) * 0.9 + 0.25 : 0.2;
          nr = nr + (grey - nr) * Math.min(1, spill);
          ng = ng + (grey - ng) * Math.min(1, spill);
          nb = nb + (grey - nb) * Math.min(1, spill);
          px[i] = Math.max(0, Math.min(255, nr));
          px[i + 1] = Math.max(0, Math.min(255, ng));
          px[i + 2] = Math.max(0, Math.min(255, nb));
          px[i + 3] = Math.round(a * 255);
        }
        const keyed = document.createElement('canvas');
        keyed.width = W;
        keyed.height = H;
        keyed.getContext('2d').putImageData(data, 0, 0);
        window.paintBackdrop(octx, W, H);
        octx.drawImage(keyed, 0, 0);
        if (cutout) cut = keyed;
      }

      const encode = (canvas, w, h, q) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const x = c.getContext('2d');
        x.imageSmoothingQuality = 'high';
        x.drawImage(canvas, 0, 0, w, h);
        return c.toDataURL('image/webp', q);
      };
      return {
        full: encode(out, W, H, 0.84),
        half: encode(out, W / 2, H / 2, 0.82),
        cutFull: cut ? encode(cut, W, H, 0.88) : null,
        cutHalf: cut ? encode(cut, W / 2, H / 2, 0.86) : null,
      };
    },
    { dataUrl, crop: p.crop, mode: p.mode, W, H, cutout: Boolean(p.cutout) },
  );

  const save = (name, url) => writeFile(path.join(outDir, name), Buffer.from(url.split(',')[1], 'base64'));
  await save(`${p.id}-${W}.webp`, result.full);
  await save(`${p.id}-${W / 2}.webp`, result.half);
  if (result.cutFull) {
    await save(`${p.id}-cutout-${W}.webp`, result.cutFull);
    await save(`${p.id}-cutout-${W / 2}.webp`, result.cutHalf);
  }
  console.log('processed', p.id);
}

await browser.close();
