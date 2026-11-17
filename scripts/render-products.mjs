// Renders concept images (public/images/renders) for the catalogue products
// whose `imagery` is 'render', using headless Chrome and the procedural models.
//
//   npm run render:products          # all render products
//   npm run render:products air      # one product
//
// Needs a local Chrome or Edge. Set CHROME_PATH to override the location.
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { products } from '../src/data/products.js';
import { SCENES } from '../src/story/timeline.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error('No Chrome/Edge found. Set CHROME_PATH.');
  process.exit(1);
}

const only = process.argv[2];
const server = await createServer({ root, logLevel: 'error', server: { port: 5199, strictPort: false } });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

const dir = path.join(root, 'public', 'images', 'renders');
await mkdir(dir, { recursive: true });
const save = (name, dataUrl) => {
  if (!dataUrl.startsWith('data:image/webp')) throw new Error(`Not WebP: ${name}`);
  return writeFile(path.join(dir, name), Buffer.from(dataUrl.split(',')[1], 'base64'));
};

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`${url}render.html`, { waitUntil: 'load' });
  await page.waitForFunction('window.__auralReady === true', { timeout: 60000 });
  if (!only || only === 'story') {
    const storyDir = path.join(root, 'public', 'story');
    await mkdir(storyDir, { recursive: true });
    for (const key of ['hero', ...SCENES.map((s) => s.key)]) {
      const dataUrl = await page.evaluate((k) => window.__aural.scene(k), key);
      await writeFile(path.join(storyDir, `scene-${key}.webp`), Buffer.from(dataUrl.split(',')[1], 'base64'));
    }
    console.log('story stills rendered');
  }
  for (const p of products) {
    if (p.imagery !== 'render' || (only && p.id !== only)) continue;
    for (const c of p.colours) {
      for (const view of c.images) {
        const r = await page.evaluate((a, b, v) => window.__aural.product(a, b, v), p.id, c.id, view);
        const base = `${p.id}-${c.id}-${view}`;
        await save(`${base}-1600.webp`, r.full);
        await save(`${base}-800.webp`, r.half);
        await save(`${base}-cutout-1600.webp`, r.cutFull);
        await save(`${base}-cutout-800.webp`, r.cutHalf);
      }
    }
    console.log('rendered', p.id);
  }
} finally {
  await browser.close();
  await server.close();
}
