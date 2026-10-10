// Client minimale per PayPal Checkout (Orders v2), senza dipendenze.
// Servono PAYPAL_CLIENT_ID e PAYPAL_SECRET (dal conto PayPal Business, sezione sviluppatori).
// PAYPAL_ENV=sandbox per le prove, altrimenti live.
const API = () => process.env.PAYPAL_API_URL
  || (process.env.PAYPAL_ENV === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com');
export const paypalEnabled = () => !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET);

let token = null;
async function auth() {
  if (token && token.expires > Date.now()) return token.value;
  const basic = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${API()}/v1/oauth2/token`, {
    method: 'POST', headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal login: ${json.error_description || res.status}`);
  token = { value: json.access_token, expires: Date.now() + (json.expires_in - 60) * 1000 };
  return token.value;
}

async function paypal(path, body) {
  const res = await fetch(API() + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await auth()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PayPal ${path}: ${json.message || json.name || res.status}`);
  return json;
}

const money = (n) => ({ currency_code: 'EUR', value: n.toFixed(2) });

// Crea l'ordine PayPal e restituisce { id, url } dove mandare il cliente.
export async function createPaypalOrder(order, baseUrl) {
  const out = await paypal('/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: order.id, custom_id: order.id,
      amount: { ...money(order.total), breakdown: { item_total: money(order.subtotal), shipping: money(order.shipping.rate) } },
      items: order.items.map((i) => ({ name: `${i.name} (${i.size})`.slice(0, 127), quantity: String(i.qty), unit_amount: money(i.price) })),
    }],
    payment_source: { paypal: { experience_context: {
      brand_name: 'Your Favorite Daddy Shop', locale: order.lang === 'en' ? 'en-GB' : 'it-IT',
      shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW',
      return_url: `${baseUrl}/api/paypal/return?order=${order.id}`,
      cancel_url: `${baseUrl}/#/checkout`,
    } } },
  });
  return { id: out.id, url: out.links.find((l) => l.rel === 'payer-action' || l.rel === 'approve').href };
}

// Incassa l'ordine dopo che il cliente ha approvato. Restituisce l'importo incassato o null.
export async function capturePaypalOrder(id) {
  const out = await paypal(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`);
  if (out.status !== 'COMPLETED') return null;
  const cap = out.purchase_units?.[0]?.payments?.captures?.[0];
  return { id: cap?.id || id, amount: +(cap?.amount?.value || 0) };
}
