// Server del negozio: file statici + API per catalogo, ordini e pannello admin.
// Avvio: node server.js   (porta 3000, oppure PORT)
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createOrder, shippingRate, findItem } from './lib/printful.js';
import { stripeEnabled, createCheckoutSession, getCheckoutSession, verifyWebhook } from './lib/stripe.js';
import { paypalEnabled, createPaypalOrder, capturePaypalOrder } from './lib/paypal.js';
import { sizeAvailable } from './public/regions.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(root, 'public');
const CATALOG = path.join(root, 'data/catalog.json');
const ORDERS = path.join(root, 'data/orders.json');
const PORT = +process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'daddy';
const PRINTFUL_DRAFTS = process.env.PRINTFUL_DRAFTS === '1';
const PRINTFUL_CONFIRM = process.env.PRINTFUL_CONFIRM === '1';
const PUBLIC_URL = process.env.PUBLIC_URL; // es. https://daddymommyshop.com (per i link di ritorno da PayPal e Stripe)
const STATUSES = ['in attesa di pagamento', 'ricevuto', 'pagato', 'in produzione', 'spedito', 'annullato'];
const FALLBACK_SHIPPING = { rate: 4.49, name: 'Spedizione standard', minDays: 3, maxDays: 7 };

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

const readJson = async (f, fallback) => JSON.parse(await fs.readFile(f, 'utf8').catch(() => JSON.stringify(fallback)));
const send = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
const raw = (req) => new Promise((ok, ko) => {
  let s = ''; req.on('data', (c) => { s += c; if (s.length > 1e6) ko(new Error('troppo grande')); });
  req.on('end', () => ok(s));
});
const body = async (req) => JSON.parse((await raw(req)) || '{}');
const isAdmin = (req) => {
  const a = req.headers.authorization || '';
  const given = Buffer.from(a.replace(/^Bearer /, ''));
  const want = Buffer.from(ADMIN_PASSWORD);
  return given.length === want.length && crypto.timingSafeEqual(given, want);
};

// Le scritture su orders.json passano tutte da qui, una alla volta.
let queue = Promise.resolve();
const withOrders = (fn) => (queue = queue.then(async () => {
  const orders = await readJson(ORDERS, []);
  const out = await fn(orders);
  await fs.writeFile(ORDERS, JSON.stringify(orders, null, 2));
  return out;
}));

function validateOrder(input, catalog) {
  const c = input.customer || {};
  const errors = [];
  for (const [k, label] of [['name', 'nome'], ['email', 'email'], ['address', 'indirizzo'], ['city', 'città'], ['zip', 'CAP']]) {
    if (!String(c[k] || '').trim()) errors.push(`Manca ${label}`);
  }
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) errors.push('Email non valida');
  const country = String(c.country || 'IT').slice(0, 2).toUpperCase();
  const items = (input.items || []).map((it) => {
    const { product: p, model: m, size: s } = findItem(catalog, it.productId, it.size);
    const qty = Math.max(1, Math.min(20, parseInt(it.qty, 10) || 1));
    if (!p || !s) { errors.push(`Prodotto non trovato: ${it.productId} ${it.size}`); return null; }
    if (!sizeAvailable(s, country)) errors.push(`${p.name} ${s.size} non si spedisce in ${country}`);
    const name = m.type === 'unisex' ? p.name : `${p.name} (${m.label.en})`;
    return { productId: m.id, slug: p.slug, model: m.type, name, size: s.size, qty, price: s.price };
  }).filter(Boolean);
  if (!items.length) errors.push('Il carrello è vuoto');
  return { errors, items, customer: Object.fromEntries(
    ['name', 'email', 'phone', 'address', 'city', 'zip', 'province', 'country', 'note'].map((k) => [k, String(c[k] || '').trim().slice(0, 300)])
      .concat([['country', country]])) };
}

async function quoteShipping(items, catalog, country) {
  try { return await shippingRate(items, catalog, country); } catch (e) { console.warn('spedizione:', e.message); return FALLBACK_SHIPPING; }
}

// Pagamento confermato: segna l'ordine come pagato e lo manda a Printful (una volta sola).
async function markPaid(orderId, catalog, payment) {
  const order = await withOrders((orders) => {
    const o = orders.find((x) => x.id === orderId);
    if (!o || o.paidAt) return null;
    o.status = 'pagato'; o.paidAt = new Date().toISOString(); o.payment = payment;
    return structuredClone(o);
  });
  if (!order) return;
  try {
    const pfOrder = await createOrder(order, catalog, PRINTFUL_CONFIRM);
    await withOrders((orders) => { const o = orders.find((x) => x.id === orderId); o.printfulOrderId = pfOrder.id; if (PRINTFUL_CONFIRM) o.status = 'in produzione'; });
  } catch (e) {
    await withOrders((orders) => { orders.find((x) => x.id === orderId).printfulError = e.message; });
  }
}

const baseUrl = (req) => PUBLIC_URL || `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;

async function api(req, res, url) {
  const catalog = await readJson(CATALOG, { products: [] });

  if (req.method === 'GET' && url.pathname === '/api/catalog') return send(res, 200, catalog);

  if (req.method === 'POST' && url.pathname === '/api/shipping') {
    const input = await body(req);
    const country = String(input.country || 'IT').slice(0, 2).toUpperCase();
    const { items } = validateOrder({ ...input, customer: { name: 1, email: 'a@b.c', address: 1, city: 1, zip: 1, country } }, catalog);
    if (!items.length) return send(res, 400, { error: 'Carrello vuoto' });
    return send(res, 200, await quoteShipping(items, catalog, country));
  }

  if (req.method === 'GET' && url.pathname === '/api/config') return send(res, 200, { paypal: paypalEnabled(), stripe: stripeEnabled() });

  if (req.method === 'POST' && url.pathname === '/api/orders') {
    const input = await body(req);
    const { errors, items, customer } = validateOrder(input, catalog);
    if (errors.length) return send(res, 400, { errors });
    const shipping = await quoteShipping(items, catalog, customer.country);
    const subtotal = Math.round(items.reduce((t, i) => t + i.price * i.qty, 0) * 100) / 100;
    // PayPal o carta (Stripe): si usa quello scelto dal cliente, se è attivo.
    const provider = input.provider === 'stripe' && stripeEnabled() ? 'stripe'
      : paypalEnabled() ? 'paypal' : stripeEnabled() ? 'stripe' : null;
    const order = {
      id: 'YFD-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(), status: provider ? 'in attesa di pagamento' : 'ricevuto',
      lang: input.lang === 'en' ? 'en' : 'it', customer, items, subtotal, shipping,
      total: Math.round((subtotal + shipping.rate) * 100) / 100,
    };
    if (provider) {
      try {
        let payUrl;
        if (provider === 'paypal') {
          const pp = await createPaypalOrder(order, baseUrl(req));
          order.paypalOrderId = pp.id; payUrl = pp.url;
        } else {
          const session = await createCheckoutSession(order, baseUrl(req));
          order.stripeSessionId = session.id; payUrl = session.url;
        }
        await withOrders((orders) => orders.push(order));
        return send(res, 201, { id: order.id, total: order.total, payUrl });
      } catch (e) {
        console.error(e);
        return send(res, 502, { error: 'Il pagamento non si apre. Riprova tra poco.' });
      }
    }
    if (PRINTFUL_DRAFTS) {
      try { order.printfulOrderId = (await createOrder(order, catalog, false)).id; }
      catch (e) { order.printfulError = e.message; }
    }
    await withOrders((orders) => orders.push(order));
    return send(res, 201, { id: order.id, total: order.total });
  }

  // Ritorno da Stripe: controllo il pagamento (serve anche senza webhook).
  const st = url.pathname.match(/^\/api\/orders\/([\w-]+)\/status$/);
  if (req.method === 'GET' && st) {
    const orders = await readJson(ORDERS, []);
    const o = orders.find((x) => x.id === st[1]);
    if (!o) return send(res, 404, { error: 'Ordine non trovato' });
    if (!o.paidAt && o.stripeSessionId && stripeEnabled()) {
      const session = await getCheckoutSession(o.stripeSessionId).catch(() => null);
      if (session?.payment_status === 'paid') {
        await markPaid(o.id, catalog, { provider: 'stripe', session: session.id, amount: session.amount_total / 100 });
        return send(res, 200, { status: 'pagato', total: o.total });
      }
    }
    return send(res, 200, { status: o.status, total: o.total });
  }

  // Ritorno da PayPal: il cliente ha approvato, incasso e mando l'ordine a Printful.
  if (req.method === 'GET' && url.pathname === '/api/paypal/return') {
    const id = url.searchParams.get('order') || '';
    const o = (await readJson(ORDERS, [])).find((x) => x.id === id);
    if (!o) return send(res, 404, { error: 'Ordine non trovato' });
    let ok = !!o.paidAt;
    if (!ok && o.paypalOrderId && url.searchParams.get('token') === o.paypalOrderId) {
      const cap = await capturePaypalOrder(o.paypalOrderId).catch((e) => { console.error(e); return null; });
      if (cap) { await markPaid(o.id, catalog, { provider: 'paypal', order: o.paypalOrderId, capture: cap.id, amount: cap.amount }); ok = true; }
    }
    res.writeHead(302, { Location: ok ? `/#/grazie/${o.id}?paid=1` : '/#/checkout?pay=failed' });
    return res.end();
  }

  if (req.method === 'POST' && url.pathname === '/api/stripe/webhook') {
    const text = await raw(req);
    if (!verifyWebhook(text, req.headers['stripe-signature'])) return send(res, 400, { error: 'Firma non valida' });
    const event = JSON.parse(text);
    if (event.type === 'checkout.session.completed' && event.data.object.payment_status === 'paid') {
      const s = event.data.object;
      await markPaid(s.metadata?.order_id || s.client_reference_id, catalog, { provider: 'stripe', session: s.id, amount: s.amount_total / 100 });
    }
    return send(res, 200, { received: true });
  }

  if (url.pathname.startsWith('/api/admin/')) {
    if (!isAdmin(req)) return send(res, 401, { error: 'Password errata' });
    if (req.method === 'GET' && url.pathname === '/api/admin/orders') {
      const orders = await readJson(ORDERS, []);
      const customers = Object.values(orders.reduce((acc, o) => {
        const k = o.customer.email.toLowerCase();
        acc[k] ??= { email: o.customer.email, name: o.customer.name, phone: o.customer.phone, city: o.customer.city, orders: 0, spent: 0, last: o.createdAt };
        acc[k].orders++; acc[k].spent += o.total; if (o.createdAt > acc[k].last) acc[k].last = o.createdAt;
        return acc;
      }, {}));
      return send(res, 200, { orders: orders.reverse(), customers, statuses: STATUSES });
    }
    const m = url.pathname.match(/^\/api\/admin\/orders\/([\w-]+)$/);
    if (req.method === 'PATCH' && m) {
      const { status } = await body(req);
      if (!STATUSES.includes(status)) return send(res, 400, { error: 'Stato non valido' });
      const ok = await withOrders((orders) => { const o = orders.find((x) => x.id === m[1]); if (o) o.status = status; return !!o; });
      return ok ? send(res, 200, { ok: true }) : send(res, 404, { error: 'Ordine non trovato' });
    }
  }
  return send(res, 404, { error: 'Non trovato' });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let p = url.pathname === '/' ? '/index.html' : url.pathname === '/admin' ? '/admin.html' : url.pathname;
    const file = path.join(PUBLIC, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
    const data = await fs.readFile(file).catch(() => null);
    if (!data) { res.writeHead(404); return res.end('Non trovato'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    console.error(e);
    send(res, 500, { error: 'Errore del server' });
  }
}).listen(PORT, () => console.log(`Negozio su http://localhost:${PORT}  (admin: /admin)`));
