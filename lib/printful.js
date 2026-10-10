// Client minimale per l'API Printful (v1). Nessuna dipendenza.
// In produzione il token arriva da PRINTFUL_API_TOKEN; nell'ambiente cloud di
// Claude l'header Authorization viene aggiunto dal proxy, quindi può mancare.
const BASE = 'https://api.printful.com';

export const STORE_ID = process.env.PRINTFUL_STORE_ID || '15135959';

export async function pf(path, { method = 'GET', body } = {}) {
  const headers = { 'X-PF-Store-Id': STORE_ID };
  if (process.env.PRINTFUL_API_TOKEN) headers.Authorization = `Bearer ${process.env.PRINTFUL_API_TOKEN}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json.code && json.code >= 400)) {
    const msg = json?.error?.message || json?.result || res.statusText;
    throw new Error(`Printful ${method} ${path}: ${res.status} ${msg}`);
  }
  return json.result;
}

// Crea un ordine BOZZA su Printful (confirm=false: non parte la produzione
// finché non lo confermi dalla dashboard Printful).
export async function createDraftOrder(order, catalog) {
  const items = order.items.map((it) => {
    const p = catalog.products.find((x) => x.id === it.productId);
    const s = p.sizes.find((x) => x.size === it.size);
    if (p.source.type === 'local') throw new Error(`"${p.name}" non è ancora un prodotto Printful: crealo e rifai la sincronizzazione`);
    const base = { quantity: it.qty, retail_price: p.price.toFixed(2), name: `${p.name} (${it.size})` };
    if (p.source.type === 'sync') return { ...base, sync_variant_id: s.syncVariantId };
    return { ...base, variant_id: s.variantId, product_template_id: p.source.id };
  });
  const c = order.customer;
  return pf('/orders?confirm=false', {
    method: 'POST',
    body: {
      external_id: order.id,
      recipient: {
        name: c.name, email: c.email, phone: c.phone || undefined,
        address1: c.address, city: c.city, zip: c.zip, country_code: c.country || 'IT',
        state_code: c.province || undefined,
      },
      items,
    },
  });
}
