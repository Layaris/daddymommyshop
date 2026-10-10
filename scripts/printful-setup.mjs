// Crea o aggiorna su Printful un prodotto per ogni design di data/designs.json
// (Bella+Canvas 3001, colore del design, tutte le taglie). Scrive l'id Printful nel file.
// I file di stampa devono essere raggiungibili da Printful: li prende da GitHub (repo pubblica).
// Uso: node scripts/printful-setup.mjs [slug ...]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pf } from '../lib/printful.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data/designs.json');
const data = JSON.parse(await fs.readFile(file, 'utf8'));
const RAW = process.env.DESIGN_BASE_URL || 'https://raw.githubusercontent.com/Layaris/daddymommyshop/main/';
const only = process.argv.slice(2);
const blank = await pf(`/products/${data.base}`);

for (const d of data.designs) {
  if (only.length && !only.includes(d.slug)) continue;
  const vs = blank.variants.filter((v) => v.color === d.colore);
  const min = Math.min(...vs.map((v) => +v.price));
  const base = (d.prezzo ?? data.prezzo) + (d.retro ? data.prezzoRetro : 0);
  const files = [{ type: 'default', url: RAW + d.fronte }];
  if (d.retro) files.push({ type: 'back', url: RAW + d.retro });
  const variant = (v, id) => ({
    ...(id ? { id } : { variant_id: v.id }),
    external_id: `yfd-${d.slug}-${v.size}`.toLowerCase(),
    retail_price: (base + (+v.price - min)).toFixed(2),
    files,
  });
  if (d.printful) {
    const cur = await pf(`/store/products/${d.printful}`);
    const byVariant = new Map(cur.sync_variants.map((s) => [s.variant_id, s.id]));
    await pf(`/store/products/${d.printful}`, {
      method: 'PUT',
      body: { sync_product: { name: d.nome }, sync_variants: vs.map((v) => variant(v, byVariant.get(v.id))) },
    });
    console.log(`aggiornato ${d.slug} (${d.printful})`);
  } else {
    const r = await pf('/store/products', {
      method: 'POST',
      body: { sync_product: { name: d.nome, external_id: `yfd-${d.slug}` }, sync_variants: vs.map((v) => variant(v)) },
    });
    d.printful = r.id;
    console.log(`creato ${d.slug} (${r.id})`);
  }
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
}
