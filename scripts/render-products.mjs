// Renders the product images (public/products, 1200 and 600 px wide) and the
// story stills (public/story) from the procedural 3D models, using headless
// Chrome.
//
//   npm run render:products            # everything
//   npm run render:products products   # product images only
//   npm run render:products story      # story stills only
//   npm run render:products products pro-x   # one product
//
// Needs a local Chrome or Edge. Set CHROME_PATH to override the location.
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { products, viewsFor } from '../src/data/products.js';
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

const [only, onlyProduct] = process.argv.slice(2);

const server = await createServer({ root, logLevel: 'error', server: { port: 5199, strictPort: false } });
await server.listen();
const url = server.resolvedUrls.local[0];

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

const writeDataUrl = async (file, dataUrl) => {
  if (!dataUrl.startsWith('data:image/webp')) throw new Error(`Not a WebP image for ${file}`);
  await writeFile(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
};

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`${url}render.html`, { waitUntil: 'load' });
  await page.waitForFunction('window.__auralReady === true', { timeout: 60000 });

  if (only !== 'story') {
    const dir = path.join(root, 'public', 'products');
    await mkdir(dir, { recursive: true });
    if (!onlyProduct) {
      // Remove images from earlier catalogue versions.
      for (const f of await readdir(dir)) await unlink(path.join(dir, f));
    }
    let count = 0;
    for (const p of products) {
      if (onlyProduct && p.id !== onlyProduct) continue;
      for (const c of p.colours) {
        for (const view of viewsFor(p)) {
          const [full, half] = await page.evaluate((a, b, v) => window.__aural.product(a, b, v), p.id, c.id, view);
          await writeDataUrl(path.join(dir, `${p.id}-${c.id}-${view}-1200.webp`), full);
          await writeDataUrl(path.join(dir, `${p.id}-${c.id}-${view}-600.webp`), half);
          count += 2;
        }
      }
      console.log('rendered', p.id);
    }
    console.log(`${count} product images`);
  }

  if (only !== 'products') {
    const dir = path.join(root, 'public', 'story');
    await mkdir(dir, { recursive: true });
    for (const f of await readdir(dir)) await unlink(path.join(dir, f));
    for (const key of ['hero', ...SCENES.map((s) => s.key)]) {
      const data = await page.evaluate((k) => window.__aural.scene(k), key);
      await writeDataUrl(path.join(dir, `scene-${key}.webp`), data);
    }
    console.log('story stills rendered');
  }
} finally {
  await browser.close();
  await server.close();
}
