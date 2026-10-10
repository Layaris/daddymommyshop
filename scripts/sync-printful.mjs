// Costruisce data/catalog.json dai design (data/designs.json) e dai prodotti Printful:
// prezzi e taglie arrivano da Printful, testi, sezioni e foto dal file dei design.
// Uso: node scripts/sync-printful.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pf } from '../lib/printful.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await fs.readFile(path.join(root, 'data/designs.json'), 'utf8'));
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const exists = (f) => fs.access(path.join(root, 'public', f)).then(() => true, () => false);

const products = [];
for (const [rank, d] of data.designs.entries()) {
  if (!d.printful) { console.warn(`${d.slug}: non ancora su Printful (node scripts/printful-setup.mjs ${d.slug})`); continue; }
  const detail = await pf(`/store/products/${d.printful}`);
  const sizes = detail.sync_variants.map((v) => ({
    size: v.size, syncVariantId: v.id, variantId: v.variant_id, price: +v.retail_price,
    inStock: v.availability_status === 'active',
  })).sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
  const shot = (tipo) => d.mockup?.find((m) => m.tipo === tipo)?.src || null;
  const gallery = ['flat-front', 'couple-front', 'men-s-lifestyle-front', 'women-s-lifestyle-front', 'flat-back', 'couple-back', 'women-s-lifestyle-back']
    .map(shot).filter(Boolean);
  const art = `img/art/${d.slug}.png`;
  const artBack = `img/art/${d.slug}-back.png`;
  products.push({
    id: `sync:${d.printful}`, slug: d.slug, name: d.nome,
    it: d.it, en: d.en, sections: d.sezioni, spice: d.sfacciataggine,
    price: Math.min(...sizes.map((s) => s.price)), color: d.colore,
    colorHex: d.colore === 'Black' ? '#141416' : '#f4f3ef',
    blank: { title: data.maglietta }, back: !!d.retro, by: d.autore,
    sizes, image: shot('flat-front'), couple: shot('couple-front'), gallery,
    art: (await exists(art)) ? art : null, artBack: d.retro && (await exists(artBack)) ? artBack : null,
    source: { type: 'sync', id: d.printful }, available: sizes.some((s) => s.inStock), rank,
  });
}

const out = { store: 'Your Favorite Daddy Shop', storeId: +process.env.PRINTFUL_STORE_ID || 15135959,
  syncedAt: new Date().toISOString(), products };
await fs.writeFile(path.join(root, 'data/catalog.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`catalogo: ${products.length} prodotti`);
for (const p of products) console.log(` - ${p.name} [${p.sections}] €${p.price} foto:${p.gallery.length}${p.available ? '' : ' (NON disponibile)'}`);
