// Legge prodotti e modelli dal negozio Printful e scrive data/catalog.json.
// Uso: node scripts/sync-printful.mjs   (opzione --no-images per saltare il download dei mockup)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pf } from '../lib/printful.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const overrides = JSON.parse(await fs.readFile(path.join(root, 'data/catalog-overrides.json'), 'utf8'));
const withImages = !process.argv.includes('--no-images');
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function downloadImage(url, name) {
  if (!withImages || !url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const type = res.headers.get('content-type') || '';
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
    const file = `img/${name}.${ext}`;
    await fs.writeFile(path.join(root, 'public', file), Buffer.from(await res.arrayBuffer()));
    return file;
  } catch (e) {
    console.warn(`  immagine non scaricata (${name}): ${e.message}`);
    return null;
  }
}

// Taglie e costi della base Printful nel colore del design.
async function blankSizes(catalogProductId, color, basePrice) {
  const cat = await pf(`/products/${catalogProductId}`).catch(() => null);
  if (!cat) return { blank: null, sizes: [] };
  const vs = cat.variants.filter((v) => v.color === color);
  const minCost = Math.min(...vs.map((v) => +v.price));
  const sizes = vs
    .map((v) => ({
      size: v.size,
      variantId: v.id,
      // stesso ricarico per tutte le taglie: le taglie grandi costano quanto in più costano a Printful
      price: Math.round((basePrice + (+v.price - minCost)) * 100) / 100,
      inStock: v.in_stock !== false,
    }))
    .sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
  const p = cat.product;
  return { blank: { id: p.id, title: p.title.split(' | ')[0], brand: p.brand, model: p.model }, sizes };
}

const products = [];
const local = [];
const base = overrides.prezzoBaseDefault;

// 1) Prodotti già pubblicati nel negozio
const synced = await pf('/store/products?limit=100');
for (const sp of synced) {
  const key = `sync:${sp.id}`;
  const o = overrides.prodotti[key] || {};
  if (o.nascondi) continue;
  const detail = await pf(`/store/products/${sp.id}`);
  const v0 = detail.sync_variants[0];
  const price = o.prezzo ?? +v0.retail_price;
  const sizes = detail.sync_variants.map((v) => ({
    size: v.size, syncVariantId: v.id, variantId: v.variant_id, price: o.prezzo ?? +v.retail_price,
    inStock: v.availability_status === 'active',
  }));
  const name = o.nome || sp.name;
  products.push({
    id: key, slug: slugify(name), name, opener: o.apertura || '', tagline: o.frase || '', sections: o.sezioni || ['uomo', 'donna'],
    spice: o.sfacciataggine || 3, price, color: v0.color, colorHex: v0.color === 'Black' ? '#111111' : '#ffffff',
    blank: { title: v0.product.name.replace(/\s*\(.*\)$/, '') },
    sizes, image: (await downloadImage(sp.thumbnail_url, slugify(name))) || sp.thumbnail_url,
    remoteImage: sp.thumbnail_url, source: { type: 'sync', id: sp.id },
    available: sizes.some((s) => s.inStock),
  });
}

// 2) Modelli salvati (product templates)
const tpl = await pf('/product-templates?limit=100');
let n = 0;
for (const t of tpl.items) {
  const key = `template:${t.id}`;
  const o = overrides.prodotti[key] || {};
  if (o.nascondi) continue;
  const color = t.colors?.[0]?.color_name || 'White';
  const price = o.prezzo ?? base;
  const { blank, sizes } = await blankSizes(t.product_id, color, price);
  n++;
  const name = o.nome || `Design n° ${n}`;
  products.push({
    id: key, slug: slugify(name), name, tagline: o.frase || '', sections: o.sezioni || ['uomo', 'donna'],
    spice: o.sfacciataggine || 3, price, color, colorHex: t.colors?.[0]?.color_codes?.[0] || '#ffffff',
    blank, sizes, image: (await downloadImage(t.mockup_file_url, slugify(name))) || t.mockup_file_url,
    remoteImage: t.mockup_file_url, source: { type: 'template', id: t.id },
    available: sizes.length > 0, unnamed: !o.nome,
  });
}

// 3) Design nostri non ancora su Printful (local:...): in testa, nascosti se Printful ha già lo stesso nome
for (const [key, o] of Object.entries(overrides.prodotti)) {
  if (!key.startsWith('local:') || o.nascondi) continue;
  if (products.some((p) => p.name.toLowerCase() === o.nome.toLowerCase())) continue;
  const { blank, sizes } = await blankSizes(o.base, o.colore, o.prezzo ?? base);
  local.push({
    id: key, slug: key.slice(6), name: o.nome, opener: o.apertura || '', tagline: o.frase || '',
    sections: o.sezioni || ['uomo', 'donna'], spice: o.sfacciataggine || 3, price: o.prezzo ?? base,
    color: o.colore, colorHex: o.colore === 'Black' ? '#1a1a1c' : '#f6f5f2', blank, sizes,
    image: o.immagine, source: { type: 'local', id: key.slice(6), design: o.design },
    available: sizes.length > 0, onPrintful: false,
  });
}
products.unshift(...local);

const out = { store: 'Your Favorite Daddy Shop', storeId: +process.env.PRINTFUL_STORE_ID || 15135959,
  syncedAt: new Date().toISOString(), products };
await fs.writeFile(path.join(root, 'data/catalog.json'), JSON.stringify(out, null, 2));
console.log(`catalogo: ${products.length} prodotti`);
for (const p of products) console.log(` - ${p.name} [${p.sections}] €${p.price} ${p.available ? '' : '(NON disponibile)'} img=${p.image.startsWith('img/') ? 'locale' : 'remota'}`);
