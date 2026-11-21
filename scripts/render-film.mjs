// Renders the Pro X scroll film (public/media/prox/<chapter>/<lg|sm>/NNN.webp)
// from the procedural model with headless Chrome. Original footage: no stock
// video, no third-party brand.
//
//   npm run render:film            # all chapters, both sizes
//   npm run render:film -- --preview   # 3 frames per chapter, for a quick look
//
// Needs a local Chrome or Edge. Set CHROME_PATH to override the location.
import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRAMES = 45;
const preview = process.argv.includes('--preview');
const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error('No Chrome/Edge found. Set CHROME_PATH.');
  process.exit(1);
}

const server = await createServer({ root, logLevel: 'error', server: { port: 5198, strictPort: false } });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`${url}render-film.html`, { waitUntil: 'load' });
  await page.waitForFunction('window.__filmReady === true', { timeout: 60000 });
  const chapters = await page.evaluate(() => window.__film.chapters);
  const outRoot = preview ? path.join(root, 'render-preview') : path.join(root, 'public', 'media', 'prox');
  for (const [ci, chapter] of chapters.entries()) {
    for (const size of ['lg', 'sm']) {
      const dir = path.join(outRoot, chapter, size);
      await mkdir(dir, { recursive: true });
      const indices = preview ? [0, Math.floor(FRAMES / 2), FRAMES - 1] : [...Array(FRAMES).keys()];
      for (const i of indices) {
        const data = await page.evaluate((c, t, s) => window.__film.frame(c, t, s), ci, i / (FRAMES - 1), size);
        if (!data.startsWith('data:image/webp')) throw new Error('Not WebP');
        await writeFile(path.join(dir, `${String(i + 1).padStart(3, '0')}.webp`), Buffer.from(data.split(',')[1], 'base64'));
      }
      console.log('rendered', chapter, size);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
