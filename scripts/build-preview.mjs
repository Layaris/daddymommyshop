// Crea un'anteprima in un solo file HTML (dist/anteprima.html) con catalogo,
// stile, script e immagini locali incorporati. Il checkout in anteprima è simulato.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => path.join(root, 'public', f);
const html = await fs.readFile(pub('index.html'), 'utf8');
const css = await fs.readFile(pub('styles.css'), 'utf8');
const js = await fs.readFile(pub('app.js'), 'utf8');
const catalog = JSON.parse(await fs.readFile(path.join(root, 'data/catalog.json'), 'utf8'));

const inline = async (file) => {
  if (!file?.startsWith('img/')) return null; // le immagini remote non si caricano in anteprima: disegno la maglietta
  const buf = await fs.readFile(pub(file)).catch(() => null);
  if (!buf) return null;
  const type = file.endsWith('.png') ? 'image/png' : file.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  return `data:${type};base64,${buf.toString('base64')}`;
};
for (const p of catalog.products) {
  p.image = await inline(p.image);
  p.image2 = await inline(p.image2);
}

const body = html.match(/<!--APP-->([\s\S]*)<!--\/APP-->/)[1];
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
const json = JSON.stringify(catalog).replace(/</g, '\\u003c');
const out = `<title>Your Favorite Daddy Shop</title>
${fonts}
<style>${css}</style>
${body}
<script>window.__PREVIEW__ = true; window.__CATALOG__ = ${json};</script>
<script type="module">${js}</script>
`;
await fs.mkdir(path.join(root, 'dist'), { recursive: true });
await fs.writeFile(path.join(root, 'dist/anteprima.html'), out);
console.log(`dist/anteprima.html (${Math.round(out.length / 1024)} KB)`);
