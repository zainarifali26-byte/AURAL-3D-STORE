// Turns the source film clips into graded WebP frame sequences for the
// scroll-driven film on the home page (public/media/seq/<chapter>/<size>/NNN.webp),
// plus a graded poster for the hero loop. Uses headless Chrome's video decoder
// and canvas, so no ffmpeg is needed.
//
//   node scripts/extract-frames.mjs <folder with <pexelsId>.mp4 originals>
//
// Footage: H.Espinosa Films on Pexels (Pexels License). Originals are not
// committed; download them from https://www.pexels.com/video/<id>/.
import puppeteer from 'puppeteer-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = process.argv[2];
if (!srcDir || !existsSync(srcDir)) {
  console.error('Usage: node scripts/extract-frames.mjs <folder with <pexelsId>.mp4 files>');
  process.exit(1);
}

// Chapters of the film, in order. `from`/`to` trim the clip (fractions).
export const CHAPTERS = [
  { id: 'case', pexels: 4982729, frames: 45, from: 0.02, to: 0.98 },
  { id: 'open', pexels: 4982732, frames: 45, from: 0.02, to: 0.98 },
  { id: 'above', pexels: 4982738, frames: 45, from: 0.05, to: 0.95 },
  { id: 'hand', pexels: 4982735, frames: 45, from: 0.02, to: 0.98 },
];
const SIZES = [
  { name: 'lg', w: 1280, h: 720, q: 0.62 },
  { name: 'sm', w: 854, h: 480, q: 0.6 },
];
// Cinematic monochrome grade, matched to the site's charcoal palette.
const GRADE = 'grayscale(1) contrast(1.32) brightness(0.6)';

const CANDIDATES = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome'].filter(Boolean);
const browser = await puppeteer.launch({
  executablePath: CANDIDATES.find((p) => existsSync(p)),
  headless: true,
  args: ['--allow-file-access-from-files'],
});
const page = await browser.newPage();
await page.goto('file:///' + path.join(root, 'index.html').split(path.sep).join('/'));

const fileUrl = (id) => 'file:///' + path.join(path.resolve(srcDir), `${id}.mp4`).split(path.sep).join('/');

async function grab(id, times, sizes) {
  return page.evaluate(
    async ({ url, times, sizes, grade }) => {
      const v = document.createElement('video');
      v.src = url;
      v.muted = true;
      v.preload = 'auto';
      await new Promise((res, rej) => {
        v.onloadedmetadata = res;
        v.onerror = () => rej(new Error('video load failed'));
      });
      const out = [];
      for (const t of times) {
        v.currentTime = Math.min(v.duration - 0.05, t * v.duration);
        await new Promise((res) => (v.onseeked = res));
        const frame = {};
        for (const s of sizes) {
          const c = document.createElement('canvas');
          c.width = s.w;
          c.height = s.h;
          const x = c.getContext('2d');
          x.filter = grade;
          // cover-fit the source into the target frame
          const scale = Math.max(s.w / v.videoWidth, s.h / v.videoHeight);
          const dw = v.videoWidth * scale;
          const dh = v.videoHeight * scale;
          x.drawImage(v, (s.w - dw) / 2, (s.h - dh) / 2, dw, dh);
          frame[s.name] = c.toDataURL('image/webp', s.q);
        }
        out.push(frame);
      }
      return out;
    },
    { url: fileUrl(id), times, sizes, grade: GRADE },
  );
}

const save = (file, dataUrl) => writeFile(file, Buffer.from(dataUrl.split(',')[1], 'base64'));

for (const ch of CHAPTERS) {
  const times = Array.from({ length: ch.frames }, (_, i) => ch.from + ((ch.to - ch.from) * i) / (ch.frames - 1));
  for (const s of SIZES) await mkdir(path.join(root, 'public', 'media', 'seq', ch.id, s.name), { recursive: true });
  // in batches to keep the page's memory small
  for (let i = 0; i < times.length; i += 9) {
    const frames = await grab(ch.pexels, times.slice(i, i + 9), SIZES);
    for (let k = 0; k < frames.length; k++) {
      const n = String(i + k + 1).padStart(3, '0');
      for (const s of SIZES) await save(path.join(root, 'public', 'media', 'seq', ch.id, s.name, `${n}.webp`), frames[k][s.name]);
    }
  }
  console.log('chapter', ch.id, ch.frames, 'frames');
}

// Hero loop poster (the video itself is graded with a CSS filter).
await mkdir(path.join(root, 'public', 'media'), { recursive: true });
const [poster] = await grab(4982734, [0.3], [{ name: 'lg', w: 1280, h: 720, q: 0.7 }]);
await save(path.join(root, 'public', 'media', 'hero-poster.webp'), poster.lg);
console.log('hero poster');
await browser.close();
