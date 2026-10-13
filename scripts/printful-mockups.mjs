// Genera con il mockup generator di Printful le foto reali di ogni design e modello
// (unisex: piatta, coppia, uomo, donna; donna: piatta, indossata) e le salva in
// public/img/pf/<slug>/ (unisex) o public/img/pf/<slug>/<modello>/. Per il 3D salva anche la
// maglietta piatta su fondo trasparente (flat-front.png / flat-back.png). Scrive l'elenco in data/designs.json.
// Uso: node scripts/printful-mockups.mjs [--rifai] [slug ...]   (senza --rifai salta i modelli che hanno già le foto)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pf } from '../lib/printful.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data/designs.json');
const data = JSON.parse(await fs.readFile(file, 'utf8'));
const RAW = process.env.DESIGN_BASE_URL || 'https://raw.githubusercontent.com/Layaris/daddymommyshop/main/';
const redo = process.argv.includes('--rifai');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const exists = (f) => fs.access(f).then(() => true, () => false);

// Per ogni modello: gruppi di foto e posizione della stampa 4500x5400 nell'area di Printful.
const SETUP = {
  unisex: { groups: ['Flat', "Couple's", "Men's Lifestyle", "Women's Lifestyle"], main: 'Couple',
    position: { area_width: 1800, area_height: 2400, width: 1800, height: 2160, top: 0, left: 0 } },
  donna: { groups: ['Flat', "Women's Lifestyle", "Women's"], main: 'Flat',
    position: { area_width: 1500, area_height: 1800, width: 1500, height: 1800, top: 0, left: 0 } },
  essenziale: { groups: ['Flat', "Men's Lifestyle", "Women's Lifestyle"], main: 'Flat',
    position: { area_width: 1800, area_height: 2400, width: 1800, height: 2160, top: 0, left: 0 } },
  premium: { groups: ['Flat', "Men's", "Women's"], main: 'Flat',
    position: { area_width: 1800, area_height: 2400, width: 1800, height: 2160, top: 0, left: 0 } },
};
const blanks = {};
for (const [tipo, m] of Object.entries(data.modelli)) blanks[tipo] = await pf(`/products/${m.base}`);

async function run(base, body) {
  const { task_key } = await pf(`/mockup-generator/create-task/${base}`, { method: 'POST', body });
  for (let i = 0; i < 45; i++) {
    await sleep(4000);
    const task = await pf(`/mockup-generator/task?task_key=${task_key}`);
    if (task.status !== 'pending') return task;
  }
  return { status: 'timeout' };
}
async function save(url, to) {
  const res = await fetch(url);
  if (!res.ok) { console.warn(`  ${path.basename(to)}: ${res.status}`); return false; }
  await fs.writeFile(to, Buffer.from(await res.arrayBuffer()));
  return true;
}

for (const d of data.designs) {
  if (only.length && !only.includes(d.slug)) continue;
  for (const m of d.modelli) {
    const setup = SETUP[m.tipo];
    const sub = m.tipo === 'unisex' ? '' : `${m.tipo}/`;
    const dir = path.join(root, 'public/img/pf', d.slug, sub);
    const src = (name) => `img/pf/${d.slug}/${sub}${name}`;
    await fs.mkdir(dir, { recursive: true });
    const variant = blanks[m.tipo].variants.find((v) => v.color === d.colore && v.size === 'M');
    const files = [{ placement: 'front', image_url: RAW + d.fronte, position: setup.position }];
    if (d.retro) files.push({ placement: 'back', image_url: RAW + d.retro, position: setup.position });

    if (redo || !m.mockup?.length) {
      const task = await run(data.modelli[m.tipo].base, { variant_ids: [variant.id], format: 'jpg', option_groups: setup.groups, files });
      if (task.status !== 'completed') { console.warn(`${d.slug} ${m.tipo}: ${task.status} ${task.error || ''}`); continue; }
      const shots = [], seen = new Set();
      for (const mk of task.mockups) {
        const vista = mk.placement === 'back' ? 'Back' : 'Front';
        // la foto principale non dice il suo gruppo: per l'unisex è quella di coppia
        const list = [...(setup.main ? [{ url: mk.mockup_url, option_group: setup.main, option: vista }] : []), ...(mk.extra || [])];
        for (const e of list) {
          if (!['Front', 'Back'].includes(e.option) || (e.option === 'Back' && !d.retro)) continue;
          const name = slugify(`${e.option_group}-${e.option}`);
          if (seen.has(name)) continue;
          seen.add(name);
          if (await save(e.url, path.join(dir, `${name}.jpg`))) shots.push({ tipo: name, gruppo: e.option_group, vista: e.option, src: src(`${name}.jpg`) });
        }
      }
      m.mockup = shots;
      console.log(`${d.slug} ${m.tipo}: ${shots.map((s) => s.tipo).join(', ')}`);
    }

    // maglietta piatta su fondo trasparente, per il 3D
    if (redo || !(await exists(path.join(dir, 'flat-front.png')) || await exists(path.join(dir, 'flat-front.webp')))) {
      const task = await run(data.modelli[m.tipo].base, { variant_ids: [variant.id], format: 'png', option_groups: ['Flat'], files });
      if (task.status !== 'completed') { console.warn(`${d.slug} ${m.tipo} png: ${task.status}`); continue; }
      for (const mk of task.mockups) {
        const flat = [{ url: mk.mockup_url, option_group: 'Flat', option: mk.placement === 'back' ? 'Back' : 'Front' }, ...(mk.extra || [])]
          .find((e) => e.option_group === 'Flat' && ['Front', 'Back'].includes(e.option));
        if (!flat || (flat.option === 'Back' && !d.retro)) continue;
        await save(flat.url, path.join(dir, `flat-${flat.option.toLowerCase()}.png`));
      }
      console.log(`${d.slug} ${m.tipo}: png`);
    }
    await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
  }
}
