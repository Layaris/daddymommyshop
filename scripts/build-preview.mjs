// Crea un'anteprima in un solo file HTML (dist/anteprima.html) con catalogo, stile, script
// e immagini incorporati. Il pagamento in anteprima è simulato; three.js arriva da jsDelivr.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => path.join(root, 'public', f);
const html = await fs.readFile(pub('index.html'), 'utf8');
const css = await fs.readFile(pub('styles.css'), 'utf8');
// app.js importa regions.js: in anteprima lo incollo dentro
const regions = (await fs.readFile(pub('regions.js'), 'utf8')).replace(/^export /gm, '');
const js = (await fs.readFile(pub('app.js'), 'utf8')).replace(/^import \{[^}]+\} from '\.\/regions\.js';$/m, regions);
const tee = (await fs.readFile(pub('tee3d.js'), 'utf8'))
  .replace("'./vendor/three.module.min.js'", "'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js'");
const catalog = JSON.parse(await fs.readFile(path.join(root, 'data/catalog.json'), 'utf8'));

const cache = new Map();
const inline = async (file) => {
  if (!file?.startsWith('img/')) return file;
  if (cache.has(file)) return cache.get(file);
  const buf = await fs.readFile(pub(file)).catch(() => null);
  const type = { png: 'image/png', webp: 'image/webp' }[file.split('.').pop()] || 'image/jpeg';
  const out = buf ? `data:${type};base64,${buf.toString('base64')}` : null;
  cache.set(file, out);
  return out;
};
// le foto si riconoscono dal nome del file: lo tengo in un frammento dopo il data URI
const named = async (file) => { const src = await inline(file); return src && `${src}#/${file.split('/').pop()}`; };
for (const p of catalog.products) {
  for (const m of p.models) {
    m.gallery = await Promise.all((m.gallery || []).map(named));
    for (const k of ['image', 'couple', 'flat', 'flatBack']) m[k] = await named(m[k]);
  }
}

const body = html.match(/<!--APP-->([\s\S]*)<!--\/APP-->/)[1];
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)[0];
const json = JSON.stringify(catalog).replace(/</g, '\\u003c');
const out = `<title>Your Favorite Daddy Shop</title>
${fonts}
<style>${css}</style>
${body}
<script>window.__PREVIEW__ = true; window.__CATALOG__ = ${json};
window.__tee3dReady = new Promise((r) => { window.__tee3dResolve = r; });</script>
<script type="module">${tee}
window.__tee3dResolve({ mountTee });</script>
<script type="module">${js}</script>
`;
await fs.mkdir(path.join(root, 'dist'), { recursive: true });
await fs.writeFile(path.join(root, 'dist/anteprima.html'), out);
console.log(`dist/anteprima.html (${Math.round(out.length / 1024)} KB)`);
