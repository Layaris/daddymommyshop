// Client minimale per Stripe Checkout (senza dipendenze).
// Serve STRIPE_SECRET_KEY; per il webhook anche STRIPE_WEBHOOK_SECRET.
import crypto from 'node:crypto';

const KEY = () => process.env.STRIPE_SECRET_KEY;
export const stripeEnabled = () => !!KEY();

// Stripe vuole i parametri in formato form: a[b][0][c]=valore
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripe(path, { method = 'GET', body } = {}) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    method,
    headers: { Authorization: `Bearer ${KEY()}`, ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: body ? form(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe ${method} ${path}: ${json?.error?.message || res.status}`);
  return json;
}

const cents = (n) => Math.round(n * 100);

export function createCheckoutSession(order, baseUrl) {
  return stripe('/checkout/sessions', {
    method: 'POST',
    body: {
      mode: 'payment',
      locale: order.lang === 'en' ? 'en' : 'it',
      customer_email: order.customer.email,
      client_reference_id: order.id,
      metadata: { order_id: order.id },
      success_url: `${baseUrl}/#/grazie/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#/checkout`,
      line_items: order.items.map((i) => ({
        quantity: i.qty,
        price_data: { currency: 'eur', unit_amount: cents(i.price), product_data: { name: `${i.name} (${i.size})` } },
      })),
      shipping_options: [{ shipping_rate_data: {
        type: 'fixed_amount', display_name: order.shipping.name,
        fixed_amount: { amount: cents(order.shipping.rate), currency: 'eur' },
      } }],
    },
  });
}

export const getCheckoutSession = (id) => stripe(`/checkout/sessions/${encodeURIComponent(id)}`);

// Verifica la firma del webhook (header Stripe-Signature: t=...,v1=...).
export function verifyWebhook(raw, header, secret = process.env.STRIPE_WEBHOOK_SECRET) {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')).filter((p) => p.length === 2 && p[0] !== 'v1'));
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!parts.t || Math.abs(Date.now() / 1000 - +parts.t) > 300) return false;
  const want = crypto.createHmac('sha256', secret).update(`${parts.t}.${raw}`).digest('hex');
  return sigs.some((s) => s.length === want.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(want)));
}
