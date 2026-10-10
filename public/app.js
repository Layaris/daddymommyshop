// Your Favorite Daddy Shop: il negozio come una chat.
// Ogni maglietta è una conversazione: la frase arriva come messaggio, la
// maglietta come foto, comprare è rispondere. Funziona con il server
// (GET /api/catalog, POST /api/orders) o in anteprima statica con
// window.__CATALOG__ e window.__PREVIEW__ = true.

const SECTIONS = { uomo: 'Uomo', donna: 'Donna' };
const PREVIEW = !!window.__PREVIEW__;
const COLOR_IT = { White: 'bianca', Black: 'nera' };
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage non disponibile */ } },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

let catalog = { products: [] };
let products = [];
let cart = store.get('yfd-cart', []);

const byId = (id) => products.find((p) => p.id === id);
const bySlug = (slug) => products.find((p) => p.slug === slug);
const inSection = (s) => products.filter((p) => !s || p.sections.includes(s));
const sizeOf = (p, size) => p?.sizes.find((s) => s.size === size);
const clock = (i) => `23:${String(41 + (i * 3) % 18).padStart(2, '0')}`;
const colorName = (p) => COLOR_IT[p.color] || p.color;

/* ---------- Pezzi grafici ---------- */
const TICKS = '<svg class="ticks read" viewBox="0 0 18 12" aria-label="letto"><path d="M1 6.5l3.2 3.2L11 2.5M7.5 9.7L16.7 1"/></svg>';
const SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4l17.4-7.5a1 1 0 0 0 0-1.8L3.4 3.6a.9.9 0 0 0-1.3 1l1.6 6.1 9.3 1.3-9.3 1.3-1.6 6.1a.9.9 0 0 0 1.3 1z"/></svg>';

function teeSvg(p) {
  const dark = p.color === 'Black';
  return `<svg viewBox="0 0 400 400" role="img" aria-label="Maglietta ${esc(colorName(p))} con la scritta ${esc(p.name)}">
    <rect width="400" height="400" fill="#e6e4df"/>
    <path d="M148 46 C160 62 240 62 252 46 L300 60 L360 116 L320 162 L296 146 L298 368 C232 375 168 375 102 368 L104 146 L80 162 L40 116 L100 60 Z" fill="${dark ? '#1a1a1c' : '#f6f5f2'}"/>
    <foreignObject x="132" y="110" width="136" height="150"><div xmlns="http://www.w3.org/1999/xhtml" style="font:900 22px/1 Rubik,sans-serif;letter-spacing:-.03em;color:${dark ? '#fff4e2' : '#14113d'};text-align:center;overflow-wrap:anywhere">${esc(p.name)}</div></foreignObject>
  </svg>`;
}
function pic(p) {
  if (!p.image) return teeSvg(p);
  return `<img src="${esc(p.image)}" alt="Maglietta ${esc(colorName(p))} con la scritta ${esc(p.name)}" data-fallback="${esc(p.id)}">`;
}
// Se un mockup remoto non si carica, al suo posto disegno la maglietta.
document.addEventListener('error', (e) => {
  const el = e.target;
  if (el.tagName === 'IMG' && el.dataset.fallback) {
    const p = byId(el.dataset.fallback);
    if (p) el.outerHTML = teeSvg(p);
  }
}, true);

const heat = (n) => `<div class="heat">Sfacciataggine <span class="heat-bar" aria-label="${n} su 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span></div>`;
const meta = (t, mine) => `<div class="meta">${t}${mine ? TICKS : ''}</div>`;
const msg = (body, { cls = '', t = '', mine = false, tail = false, i = 0 } = {}) =>
  `<div class="msg arrive ${mine ? 'mine' : ''} ${tail ? 'tail' : ''} ${cls}" style="--i:${i}">${body}${t ? meta(t, mine) : ''}</div>`;

/* ---------- Pannello conversazioni ---------- */
function inbox(section, currentId) {
  const list = inSection(section);
  return `
  <div class="inbox-top">
    <h2>${section ? SECTIONS[section] : 'Le frasi'}</h2>
    <nav class="pills" aria-label="Sezioni">
      <a class="pill" href="#/tutte" ${!section ? 'aria-current="page"' : ''}>Tutte</a>
      <a class="pill" href="#/uomo" ${section === 'uomo' ? 'aria-current="page"' : ''}>Uomo</a>
      <a class="pill" href="#/donna" ${section === 'donna' ? 'aria-current="page"' : ''}>Donna</a>
    </nav>
  </div>
  <ul class="convos">${list.map((p) => `
    <li><a class="convo" href="#/p/${esc(p.slug)}" ${p.id === currentId ? 'aria-current="true"' : ''}>
      <span class="convo-pic">${pic(p)}</span>
      <span class="convo-name">${esc(p.name)}</span>
      <span class="convo-time">${eur(p.price)}</span>
      <span class="convo-last">${esc(p.opener || p.tagline || colorName(p))}</span>
      ${!p.available ? '<span class="convo-flag off">Esaurita</span>' : p.spice >= 5 ? '<span class="convo-flag">Piccante</span>' : '<span></span>'}
    </a></li>`).join('')}
  </ul>
  <div class="inbox-foot">
    <p>Ogni maglietta è stampata su richiesta da Printful e spedita in 3–7 giorni lavorativi.</p>
    <p>Le frasi sono da usare con ironia. Il consenso non è una battuta.</p>
  </div>`;
}

/* ---------- Conversazioni ---------- */
function productThread(p, { home = false } = {}) {
  const idx = products.indexOf(p);
  const first = p.sizes.findIndex((s) => s.inStock !== false);
  const sizes = p.sizes.map((s, i) => `<label><input type="radio" name="size" value="${esc(s.size)}" ${s.inStock === false ? 'disabled' : ''} ${i === first ? 'checked' : ''}><span>${esc(s.size)}</span></label>`).join('');
  const t = clock(idx);
  return `
  <div class="day">${home ? 'Stasera' : 'Oggi'}</div>
  ${p.opener ? msg(`<p>${esc(p.opener)}</p>`, { t, i: 0 }) : ''}
  ${msg(`<p class="line-text">${home ? '<span class="sr">In vetrina: </span>' : ''}${esc(p.name)}</p>`, { cls: 'line', t, i: 1 })}
  ${msg(`${pic(p)}<div class="photo-cap"><strong id="pdp-price">${eur(p.sizes[first]?.price ?? p.price)}</strong><span>${esc(p.blank?.title || 'T-shirt')} · ${esc(colorName(p))}</span></div>`, { cls: 'photo tail', t, i: 2 })}
  <div id="convo-tail"></div>
  ${p.available ? `
  <form class="reply" id="add-form" aria-label="Scegli la taglia e aggiungi al carrello">
    <div class="reply-label"><span>Rispondi con la tua taglia</span><span>vestibilità unisex</span></div>
    <fieldset class="sizes"><legend class="sr">Taglia</legend>${sizes}</fieldset>
    <button class="send" type="submit">Lo voglio${SEND}</button>
  </form>` : `
  <div class="reply"><p class="reply-label"><span>Questa maglietta non è più disponibile su Printful. Torna presto: la stiamo rifacendo.</span></p></div>`}
  ${msg(`${p.tagline ? `<p>${esc(p.tagline)}</p>` : ''}${heat(p.spice)}`, { t, tail: true, i: 4 })}
  <div class="msg arrive" style="--i:5"><dl class="details">
    <div><dt>Maglietta</dt><dd>${esc(p.blank?.title || '')}</dd></div>
    <div><dt>Colore</dt><dd>${esc(colorName(p))}</dd></div>
    <div><dt>Stampa</dt><dd>Diretta su tessuto</dd></div>
    <div><dt>Spedizione</dt><dd>3–7 giorni lavorativi</dd></div>
  </dl>${meta(t)}</div>
  <p class="sys">Stampata solo quando la ordini. Se arriva difettosa la ristampiamo gratis.</p>`;
}

function checkoutThread() {
  if (!cart.length) return `<div class="day">Oggi</div>${msg('<p>Il carrello è vuoto. Prima scegli una frase.</p><a class="link-btn" href="#/tutte">Guarda le frasi</a>', { tail: true })}`;
  const c = store.get('yfd-customer', {});
  const v = (k) => esc(c[k] || '');
  const recap = cart.map((i) => { const p = byId(i.productId); return `${i.qty}× ${esc(p.name)} (${esc(i.size)})`; }).join('<br>');
  return `
  <div class="day">Oggi</div>
  ${msg(`<p>${recap}</p>`, { mine: true, tail: true, t: 'adesso', i: 0 })}
  ${msg('<p>Ottimi gusti. Dove te le spediamo?</p>', { t: 'adesso', i: 1 })}
  <div class="msg form-msg tail arrive" style="--i:2">
    <form class="form" id="checkout-form" novalidate>
      <h3>Chi la indossa</h3>
      <div class="f half"><label for="c-name">Nome e cognome</label><input id="c-name" name="name" autocomplete="name" required value="${v('name')}"></div>
      <div class="f half"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required value="${v('email')}"></div>
      <div class="f"><label for="c-phone">Telefono, per il corriere</label><input id="c-phone" name="phone" type="tel" autocomplete="tel" value="${v('phone')}"></div>
      <h3>Dove la spediamo</h3>
      <div class="f"><label for="c-address">Indirizzo</label><input id="c-address" name="address" autocomplete="street-address" required value="${v('address')}"></div>
      <div class="f third"><label for="c-city">Città</label><input id="c-city" name="city" autocomplete="address-level2" required value="${v('city')}"></div>
      <div class="f third"><label for="c-zip">CAP</label><input id="c-zip" name="zip" autocomplete="postal-code" inputmode="numeric" required value="${v('zip')}"></div>
      <div class="f third"><label for="c-province">Provincia</label><input id="c-province" name="province" autocomplete="address-level1" maxlength="2" placeholder="MI" value="${v('province')}"></div>
      <div class="f"><label for="c-country">Paese</label>
        <select id="c-country" name="country" autocomplete="country">
          ${[['IT', 'Italia'], ['SM', 'San Marino'], ['CH', 'Svizzera'], ['FR', 'Francia'], ['DE', 'Germania'], ['ES', 'Spagna'], ['AT', 'Austria']].map(([k, n]) => `<option value="${k}" ${(c.country || 'IT') === k ? 'selected' : ''}>${n}</option>`).join('')}
        </select></div>
      <div class="f"><label for="c-note">Note, se servono</label><textarea id="c-note" name="note" rows="2">${v('note')}</textarea></div>
      <p class="errors" id="errors" role="alert"></p>
    </form>
  </div>
  ${msg('<p>Il pagamento online arriva a breve. Per ora ricevi la conferma e ti scriviamo noi per pagare, prima di stampare.</p>', { t: 'adesso', i: 3 })}
  <div class="reply"><button class="send" type="submit" form="checkout-form">Invia l'ordine · ${eur(total())}${SEND}</button></div>`;
}

function thanksThread(id) {
  return `
  <div class="day">Oggi</div>
  ${msg("<p>Ordine inviato.</p>", { mine: true, tail: true, t: 'adesso', i: 0 })}
  ${msg(`<p>Ricevuto. Ci sai fare.</p><p>Ti scriviamo a breve per il pagamento, poi la maglietta va in stampa.</p><span class="order-id">${esc(id)}</span>`, { t: 'adesso', tail: true, i: 1 })}
  <p class="sys"><a href="#/tutte">Torna alle frasi</a></p>`;
}
const lostThread = () => `<div class="day">Oggi</div>${msg('<p>Qui non c\'è nessuno. Forse ti sei perso nei suoi occhi.</p><a class="link-btn" href="#/tutte">Torna alle frasi</a>', { tail: true })}`;

/* ---------- Carrello ---------- */
const total = () => cart.reduce((t, i) => t + (sizeOf(byId(i.productId), i.size)?.price ?? 0) * i.qty, 0);
const count = () => cart.reduce((t, i) => t + i.qty, 0);
function saveCart(bump = true) {
  cart = cart.filter((i) => byId(i.productId) && i.qty > 0);
  store.set('yfd-cart', cart);
  const el = $('#cart-count');
  el.textContent = count(); el.dataset.n = count();
  if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function cartBody() {
  if (!cart.length) return `<div class="empty"><p>Ancora niente qui.</p><p>Scegli una frase e rispondi con la tua taglia.</p><a class="send" href="#/tutte" data-close>Guarda le frasi</a></div>`;
  return `<div class="items">${cart.map((i, idx) => {
    const p = byId(i.productId); const s = sizeOf(p, i.size);
    return `<div class="item"><span class="item-pic">${pic(p)}</span><div>
      <p class="item-name">${esc(p.name)}</p><p class="item-meta">Taglia ${esc(i.size)} · ${esc(colorName(p))}</p>
      <div class="item-row">
        <span class="qty"><button type="button" data-qty="${idx}" data-d="-1" aria-label="Togli una">−</button><output>${i.qty}</output><button type="button" data-qty="${idx}" data-d="1" aria-label="Aggiungi una">+</button></span>
        <span class="item-price">${eur(s.price * i.qty)}</span>
      </div>
      <button class="remove" type="button" data-remove="${idx}">Togli dal carrello</button>
    </div></div>`;
  }).join('')}</div>
  <div class="sum"><div><span>Magliette</span><span>${count()}</span></div><div><span>Spedizione</span><span>calcolata alla conferma</span></div>
    <div class="tot"><span>Totale</span><span>${eur(total())}</span></div></div>
  <a class="send" href="#/cassa" data-close>Vai alla cassa${SEND}</a>`;
}
let lastFocus = null;
function openCart() {
  lastFocus = document.activeElement;
  $('#drawer-body').innerHTML = cartBody();
  $('#drawer').hidden = false;
  document.body.style.overflow = 'hidden';
  $('.sheet-panel .round').focus();
}
function closeCart() {
  $('#drawer').hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}
function toast(text) {
  const t = $('#toast'); t.textContent = text; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- Router ---------- */
function render() {
  const [route, raw] = location.hash.replace(/^#\/?/, '').split('/');
  const arg = decodeURIComponent(raw || '');
  const app = $('#app'); const main = $('#main');
  let section = null, current = null, html, view = 'thread';
  if (!route) { current = products[0]; html = current ? productThread(current, { home: true }) : lostThread(); view = 'home'; }
  else if (route === 'tutte' || SECTIONS[route]) { section = SECTIONS[route] ? route : null; current = inSection(section)[0]; html = current ? productThread(current) : lostThread(); view = 'inbox'; }
  else if (route === 'p') { current = bySlug(arg); html = current ? productThread(current) : lostThread(); section = current?.sections.length === 1 ? current.sections[0] : null; }
  else if (route === 'cassa') html = checkoutThread();
  else if (route === 'grazie') html = thanksThread(arg);
  else html = lostThread();
  app.dataset.view = view;
  $('#inbox').innerHTML = inbox(section, current?.id);
  main.innerHTML = html;
  $('#back').hidden = view !== 'thread';
  if (route) {
    window.scrollTo(0, 0);
    main.scrollTop = 0;
    if (view === 'thread') main.focus({ preventScroll: true });
  }
  bind(route, current);
}

function bind(route, p) {
  const form = $('#add-form');
  if (form && p) {
    const price = () => { $('#pdp-price').textContent = eur(sizeOf(p, form.size.value)?.price ?? p.price); };
    form.addEventListener('change', price); price();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const size = form.size.value;
      if (!size) return toast('Scegli prima una taglia');
      const line = cart.find((i) => i.productId === p.id && i.size === size);
      if (line) line.qty++; else cart.push({ productId: p.id, size, qty: 1 });
      saveCart();
      // La risposta compare in chat, poi il negozio "scrive" e conferma.
      const tail = $('#convo-tail');
      tail.insertAdjacentHTML('beforeend', msg(`<p>Lo voglio. Taglia ${esc(size)}.</p>`, { mine: true, tail: true, t: 'adesso' }));
      tail.insertAdjacentHTML('beforeend', '<div class="typing arrive" aria-label="sta scrivendo"><i></i><i></i><i></i></div>');
      await wait(700);
      tail.lastElementChild.remove();
      tail.insertAdjacentHTML('beforeend', msg(`<p>Fatto, è nel carrello. ${count()} ${count() === 1 ? 'maglietta' : 'magliette'}, ${eur(total())}.</p><button class="link-btn" type="button" data-open-cart>Apri il carrello</button>`, { t: 'adesso', tail: true }));
    });
  }
  if (route === 'cassa') bindCheckout();
}

function bindCheckout() {
  const form = $('#checkout-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const missing = [...form.querySelectorAll('[required]')].filter((el) => !el.value.trim());
    form.querySelectorAll('input').forEach((el) => el.removeAttribute('aria-invalid'));
    missing.forEach((el) => el.setAttribute('aria-invalid', 'true'));
    const emailBad = data.email && !/^\S+@\S+\.\S+$/.test(data.email);
    if (emailBad) $('#c-email').setAttribute('aria-invalid', 'true');
    if (missing.length || emailBad) {
      $('#errors').textContent = missing.length ? 'Mancano i campi evidenziati.' : "L'email non sembra giusta: controlla la chiocciola.";
      (missing[0] || $('#c-email')).focus();
      return;
    }
    store.set('yfd-customer', data);
    const btn = document.querySelector('button[form="checkout-form"]');
    btn.disabled = true; btn.textContent = 'Invio in corso…';
    try {
      let id;
      if (PREVIEW) id = 'ANTEPRIMA-' + Date.now().toString(36).toUpperCase();
      else {
        const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: data, items: cart }) });
        const out = await res.json();
        if (!res.ok) throw new Error((out.errors || [out.error]).join('. '));
        id = out.id;
      }
      cart = []; saveCart(false);
      location.hash = `#/grazie/${encodeURIComponent(id)}`;
    } catch (err) {
      $('#errors').textContent = `L'ordine non è partito (${err.message}). Riprova tra poco.`;
      btn.disabled = false; btn.innerHTML = `Invia l'ordine · ${eur(total())}${SEND}`;
    }
  });
}

/* ---------- Avvio ---------- */
async function start() {
  try {
    catalog = window.__CATALOG__ || await (await fetch('/api/catalog')).json();
  } catch {
    $('#main').innerHTML = `<div class="day">Oggi</div>${msg('<p>Non riusciamo a caricare le magliette. Ricarica la pagina tra poco.</p>', { tail: true })}`;
    return;
  }
  // In vetrina solo i design con un nome: i modelli Printful senza nome restano fuori finché non li battezzi.
  products = catalog.products.filter((p) => !p.unnamed);
  saveCart(false);
  $('#cart-btn').addEventListener('click', openCart);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-cart]')) openCart(); });
  $('#drawer').addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]'); const r = e.target.closest('[data-remove]');
    if (q) { const i = cart[+q.dataset.qty]; i.qty = Math.max(1, Math.min(20, i.qty + +q.dataset.d)); saveCart(); $('#drawer-body').innerHTML = cartBody(); }
    else if (r) { cart.splice(+r.dataset.remove, 1); saveCart(); $('#drawer-body').innerHTML = cartBody(); }
    else if (e.target.closest('[data-close]')) closeCart();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#drawer').hidden) closeCart(); });
  window.addEventListener('hashchange', render);
  render();
}
start();
