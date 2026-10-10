// Client minimale per l'API Printful (v1). Nessuna dipendenza.
// In produzione il token arriva da PRINTFUL_API_TOKEN; nell'ambiente cloud di
// Claude l'header Authorization viene aggiunto dal proxy, quindi può mancare.
const BASE = 'https://api.printful.com';

export const STORE_ID = process.env.PRINTFUL_STORE_ID || '15135959';

export async function pf(path, { method = 'GET', body } = {}, tries = 3) {
  const headers = { 'X-PF-Store-Id': STORE_ID };
  if (process.env.PRINTFUL_API_TOKEN) headers.Authorization = `Bearer ${process.env.PRINTFUL_API_TOKEN}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  if (res.status === 429 && tries > 0) {
    // Printful limita le richieste: aspetto quanto chiede e riprovo.
    const wait = +(String(json?.error?.message || json?.result || '').match(/after (\d+)/)?.[1] || 60);
    await new Promise((r) => setTimeout(r, (wait + 1) * 1000));
    return pf(path, { method, body }, tries - 1);
  }
  if (!res.ok || (json.code && json.code >= 400)) {
    const msg = json?.error?.message || json?.result || res.statusText;
    throw new Error(`Printful ${method} ${path}: ${res.status} ${msg}`);
  }
  return json.result;
}

// Spedizione standard Printful per il carrello e il paese (EUR).
export async function shippingRate(items, catalog, country = 'IT') {
  const list = items.map((it) => {
    const p = catalog.products.find((x) => x.id === it.productId);
    return { variant_id: p.sizes.find((x) => x.size === it.size).variantId, quantity: it.qty };
  });
  const rates = await pf('/shipping/rates', { method: 'POST', body: { recipient: { country_code: country }, items: list, currency: 'EUR' } });
  const r = rates.find((x) => x.id === 'STANDARD') || rates[0];
  return { rate: +r.rate, name: r.name.replace(/\s*\(.*\)\s*$/, ''), minDays: r.minDeliveryDays, maxDays: r.maxDeliveryDays };
}

// Crea l'ordine su Printful. Con confirm=false resta in BOZZA: la stampa parte solo
// quando lo confermi dalla dashboard (o con PRINTFUL_CONFIRM=1 parte da solo dopo il pagamento).
export async function createOrder(order, catalog, confirm = false) {
  const items = order.items.map((it) => {
    const p = catalog.products.find((x) => x.id === it.productId);
    const s = p.sizes.find((x) => x.size === it.size);
    return { sync_variant_id: s.syncVariantId, quantity: it.qty, retail_price: s.price.toFixed(2), name: `${p.name} (${it.size})` };
  });
  const c = order.customer;
  return pf(`/orders?confirm=${confirm}`, {
    method: 'POST',
    body: {
      external_id: order.id,
      shipping: 'STANDARD',
      recipient: {
        name: c.name, email: c.email, phone: c.phone || undefined,
        address1: c.address, city: c.city, zip: c.zip, country_code: c.country || 'IT',
        state_code: c.province || undefined,
      },
      items,
      retail_costs: order.shipping ? { shipping: order.shipping.rate.toFixed(2) } : undefined,
    },
  });
}
