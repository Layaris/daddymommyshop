// Server del negozio: file statici + API per catalogo, ordini e pannello admin.
// Avvio: node server.js   (porta 3000, oppure PORT)
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createDraftOrder } from './lib/printful.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(root, 'public');
const CATALOG = path.join(root, 'data/catalog.json');
const ORDERS = path.join(root, 'data/orders.json');
const PORT = +process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'daddy';
const PRINTFUL_DRAFTS = process.env.PRINTFUL_DRAFTS === '1';
const STATUSES = ['ricevuto', 'pagato', 'in produzione', 'spedito', 'annullato'];

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

const readJson = async (f, fallback) => JSON.parse(await fs.readFile(f, 'utf8').catch(() => JSON.stringify(fallback)));
const send = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
const body = (req) => new Promise((ok, ko) => {
  let s = ''; req.on('data', (c) => { s += c; if (s.length > 1e5) ko(new Error('troppo grande')); });
  req.on('end', () => { try { ok(JSON.parse(s || '{}')); } catch (e) { ko(e); } });
});
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
  const items = (input.items || []).map((it) => {
    const p = catalog.products.find((x) => x.id === it.productId);
    const s = p?.sizes.find((x) => x.size === it.size);
    const qty = Math.max(1, Math.min(20, parseInt(it.qty, 10) || 1));
    if (!p || !s) { errors.push(`Prodotto non trovato: ${it.productId} ${it.size}`); return null; }
    return { productId: p.id, name: p.name, size: s.size, qty, price: s.price };
  }).filter(Boolean);
  if (!items.length) errors.push('Il carrello è vuoto');
  return { errors, items, customer: Object.fromEntries(
    ['name', 'email', 'phone', 'address', 'city', 'zip', 'province', 'country', 'note'].map((k) => [k, String(c[k] || '').trim().slice(0, 300)])) };
}

async function api(req, res, url) {
  const catalog = await readJson(CATALOG, { products: [] });

  if (req.method === 'GET' && url.pathname === '/api/catalog') return send(res, 200, catalog);

  if (req.method === 'POST' && url.pathname === '/api/orders') {
    const { errors, items, customer } = validateOrder(await body(req), catalog);
    if (errors.length) return send(res, 400, { errors });
    const order = {
      id: 'YFD-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(), status: 'ricevuto', customer, items,
      total: Math.round(items.reduce((t, i) => t + i.price * i.qty, 0) * 100) / 100,
    };
    if (PRINTFUL_DRAFTS) {
      try { order.printfulOrderId = (await createDraftOrder(order, catalog)).id; }
      catch (e) { order.printfulError = e.message; }
    }
    await withOrders((orders) => orders.push(order));
    return send(res, 201, { id: order.id, total: order.total });
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
