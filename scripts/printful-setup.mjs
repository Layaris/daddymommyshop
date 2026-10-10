// Crea o aggiorna su Printful un prodotto per ogni design e modello di data/designs.json
// (unisex: Bella+Canvas 3001, donna: Bella+Canvas 6400; colore del design, tutte le taglie).
// Scrive l'id Printful nel file. I file di stampa li prende da GitHub (repo pubblica).
// Uso: node scripts/printful-setup.mjs [--aggiorna] [slug ...]   (--aggiorna rimanda anche i prodotti già creati)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pf } from '../lib/printful.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data/designs.json');
const data = JSON.parse(await fs.readFile(file, 'utf8'));
const RAW = process.env.DESIGN_BASE_URL || 'https://raw.githubusercontent.com/Layaris/daddymommyshop/main/';
const update = process.argv.includes('--aggiorna');
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const blanks = {};
for (const [tipo, m] of Object.entries(data.modelli)) blanks[tipo] = await pf(`/products/${m.base}`);

for (const d of data.designs) {
  if (only.length && !only.includes(d.slug)) continue;
  for (const m of d.modelli) {
    if (m.printful && !update) continue;
    const model = data.modelli[m.tipo];
    const vs = blanks[m.tipo].variants.filter((v) => v.color === d.colore);
    const min = Math.min(...vs.map((v) => +v.price));
    const base = (d.prezzo ?? model.prezzo) + (d.retro ? data.prezzoRetro : 0);
    const files = [{ type: 'default', url: RAW + d.fronte }];
    if (d.retro) files.push({ type: 'back', url: RAW + d.retro });
    const suffix = m.tipo === 'unisex' ? '' : `-${m.tipo}`;
    const name = m.tipo === 'unisex' ? d.nome : `${d.nome} (Women's Relaxed)`;
    const variant = (v, id) => ({
      ...(id ? { id } : { variant_id: v.id }),
      external_id: `yfd-${d.slug}${suffix}-${v.size}`.toLowerCase(),
      retail_price: (base + (+v.price - min)).toFixed(2),
      files,
    });
    if (m.printful) {
      const cur = await pf(`/store/products/${m.printful}`);
      const byVariant = new Map(cur.sync_variants.map((s) => [s.variant_id, s.id]));
      await pf(`/store/products/${m.printful}`, {
        method: 'PUT',
        body: { sync_product: { name }, sync_variants: vs.map((v) => variant(v, byVariant.get(v.id))) },
      });
      console.log(`aggiornato ${d.slug} ${m.tipo} (${m.printful})`);
    } else {
      const r = await pf('/store/products', {
        method: 'POST',
        body: { sync_product: { name, external_id: `yfd-${d.slug}${suffix}` }, sync_variants: vs.map((v) => variant(v)) },
      });
      m.printful = r.id;
      console.log(`creato ${d.slug} ${m.tipo} (${r.id})`);
    }
    await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
  }
}
