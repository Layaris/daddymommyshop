// Costruisce data/catalog.json dai design (data/designs.json) e dai prodotti Printful:
// prezzi, taglie e zone di produzione arrivano da Printful, testi, sezioni e foto dal file dei design.
// Ogni design ha uno o più modelli (unisex, donna), ognuno è un prodotto Printful a sé.
// Uso: node scripts/sync-printful.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pf } from '../lib/printful.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await fs.readFile(path.join(root, 'data/designs.json'), 'utf8'));
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const LABEL = {
  unisex: { it: 'Classica unisex', en: 'Classic unisex' },
  donna: { it: 'Donna, morbida', en: "Women's relaxed" },
};
const GALLERY = ['flat-front', 'couple-front', 'women-s-lifestyle-front', 'women-s-front', 'men-s-lifestyle-front', 'flat-back', 'couple-back', 'women-s-lifestyle-back', 'women-s-back'];
const exists = (f) => fs.access(path.join(root, 'public', f)).then(() => true, () => false);

// Zone dove Printful produce ogni variante (EU_LV, EU_ES contano come EU).
const regions = {};
for (const m of Object.values(data.modelli)) {
  for (const v of (await pf(`/products/${m.base}`)).variants) {
    regions[v.id] = [...new Set(Object.keys(v.availability_regions || {}).map((r) => r.split('_')[0]))];
  }
}

const products = [];
for (const [rank, d] of data.designs.entries()) {
  const models = [];
  for (const m of d.modelli) {
    if (!m.printful) { console.warn(`${d.slug} ${m.tipo}: non ancora su Printful (node scripts/printful-setup.mjs ${d.slug})`); continue; }
    const detail = await pf(`/store/products/${m.printful}`);
    const sizes = detail.sync_variants.map((v) => ({
      size: v.size, syncVariantId: v.id, variantId: v.variant_id, price: +v.retail_price,
      inStock: v.availability_status === 'active', regions: regions[v.variant_id] || [],
    })).sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
    const shot = (tipo) => m.mockup?.find((x) => x.tipo === tipo)?.src || null;
    const dir = `img/pf/${d.slug}/${m.tipo === 'unisex' ? '' : m.tipo + '/'}`;
    models.push({
      id: `sync:${m.printful}`, type: m.tipo, label: LABEL[m.tipo], blank: data.modelli[m.tipo].maglietta.replace(/ (unisex|donna).*$/, ''),
      price: Math.min(...sizes.map((s) => s.price)), sizes,
      image: shot('flat-front'), couple: shot('couple-front') || shot('women-s-lifestyle-front'),
      gallery: GALLERY.map(shot).filter(Boolean),
      flat: (await exists(dir + 'flat-front.webp')) ? dir + 'flat-front.webp' : null,
      flatBack: d.retro && (await exists(dir + 'flat-back.webp')) ? dir + 'flat-back.webp' : null,
      available: sizes.some((s) => s.inStock),
    });
  }
  if (!models.length) continue;
  products.push({
    slug: d.slug, name: d.nome, it: d.it, en: d.en, sections: d.sezioni, spice: d.sfacciataggine,
    price: Math.min(...models.map((m) => m.price)), color: d.colore,
    colorHex: d.colore === 'Black' ? '#141416' : '#f4f3ef', back: !!d.retro, by: d.autore,
    models, available: models.some((m) => m.available), rank,
  });
}

const out = { store: 'Your Favorite Daddy Shop', storeId: +process.env.PRINTFUL_STORE_ID || 15135959,
  syncedAt: new Date().toISOString(), products };
await fs.writeFile(path.join(root, 'data/catalog.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`catalogo: ${products.length} design`);
for (const p of products) console.log(` - ${p.name} [${p.sections}] ${p.models.map((m) => `${m.type} €${m.price} foto:${m.gallery.length}`).join(' | ')}`);
