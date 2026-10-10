// Genera con il mockup generator di Printful le foto reali di ogni design (maglietta piatta,
// coppia, uomo, donna) e le salva in public/img/pf/<slug>/. Scrive l'elenco in data/designs.json.
// Uso: node scripts/printful-mockups.mjs [slug ...]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pf } from '../lib/printful.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data/designs.json');
const data = JSON.parse(await fs.readFile(file, 'utf8'));
const RAW = process.env.DESIGN_BASE_URL || 'https://raw.githubusercontent.com/Layaris/daddymommyshop/main/';
const GROUPS = ['Flat', "Couple's", "Men's Lifestyle", "Women's Lifestyle"];
const only = process.argv.slice(2);
const blank = await pf(`/products/${data.base}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// stampa 4500x5400 dentro l'area 1800x2400: larghezza piena, in alto
const position = { area_width: 1800, area_height: 2400, width: 1800, height: 2160, top: 0, left: 0 };

for (const d of data.designs) {
  if (only.length && !only.includes(d.slug)) continue;
  const variant = blank.variants.find((v) => v.color === d.colore && v.size === 'M');
  const files = [{ placement: 'front', image_url: RAW + d.fronte, position }];
  if (d.retro) files.push({ placement: 'back', image_url: RAW + d.retro, position });
  const { task_key } = await pf(`/mockup-generator/create-task/${data.base}`, {
    method: 'POST', body: { variant_ids: [variant.id], format: 'jpg', option_groups: GROUPS, files },
  });
  let task;
  for (let i = 0; i < 40; i++) {
    await sleep(4000);
    task = await pf(`/mockup-generator/task?task_key=${task_key}`);
    if (task.status !== 'pending') break;
  }
  if (task.status !== 'completed') { console.warn(`${d.slug}: ${task.status} ${task.error || ''}`); continue; }
  const dir = path.join(root, 'public/img/pf', d.slug);
  await fs.mkdir(dir, { recursive: true });
  const shots = [];
  const seen = new Set();
  for (const m of task.mockups) {
    // la foto principale è quella di coppia; le altre arrivano in extra
    const list = [{ url: m.mockup_url, option_group: 'Couple', option: m.placement === 'back' ? 'Back' : 'Front' }, ...(m.extra || [])];
    for (const e of list) {
      if (!['Front', 'Back'].includes(e.option) || (e.option === 'Back' && !d.retro)) continue;
      const name = slugify(`${e.option_group}-${e.option}`);
      if (seen.has(name)) continue;
      seen.add(name);
      const res = await fetch(e.url);
      if (!res.ok) { console.warn(`  ${name}: ${res.status}`); continue; }
      await fs.writeFile(path.join(dir, `${name}.jpg`), Buffer.from(await res.arrayBuffer()));
      shots.push({ tipo: name, gruppo: e.option_group, vista: e.option, src: `img/pf/${d.slug}/${name}.jpg` });
    }
  }
  d.mockup = shots;
  console.log(`${d.slug}: ${shots.map((s) => s.tipo).join(', ')}`);
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
}
