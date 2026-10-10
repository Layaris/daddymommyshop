// Your Favorite Daddy Shop: vetrina, prodotto, carrello e checkout, in italiano e in inglese.
// Funziona con il server (GET /api/catalog, POST /api/orders) oppure in anteprima
// statica con window.__CATALOG__ e window.__PREVIEW__ = true.

const PREVIEW = !!window.__PREVIEW__;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage non disponibile */ } },
};

/* ---------- Testi IT / EN ---------- */
const TEXT = {
  it: {
    skip: 'Vai al contenuto',
    announce: 'Stampata su richiesta · Spedizione in Italia e in Europa in 3–7 giorni lavorativi',
    home: 'Your Favorite Daddy Shop, home', sections: 'Sezioni', language: 'Lingua',
    uomo: 'Uomo', donna: 'Donna', tutte: 'Tutte',
    cart: 'Carrello', openCart: 'Apri il carrello', closeCart: 'Chiudi il carrello', bill: 'Il tuo conto',
    footText: 'Ogni maglietta è stampata su richiesta da Printful e spedita in 3–7 giorni lavorativi. Niente magazzino, niente sprechi, solo frasi che funzionano (quasi sempre).',
    footSmall: 'Le frasi sono da usare con ironia. Il consenso non è una battuta.',
    lines: [
      'Call me daddy.',
      "Who's your daddy tonight?",
      'Sei stanca? Mi giri in testa da tutta la sera.',
      'Credi al colpo di fulmine o devo ripassare?',
      'Non sono un fotografo, ma ci vedo bene insieme.',
      'Mi presti un bacio? Te lo restituisco.',
      'Hai una mappa? Mi sono perso nei tuoi occhi.',
      'Tuo padre fa il ladro? Ha rubato le stelle per i tuoi occhi.',
    ],
    sec: {
      uomo: { title: 'Uomo', sub: 'Per chi entra nel locale e la serata cambia.' },
      donna: { title: 'Donna', sub: 'Per chi la frase la dice per prima. E vince.' },
      tutte: { title: 'Tutte', sub: 'Tutti i design del negozio. Ogni maglietta parte in stampa solo quando la ordini.' },
    },
    eyebrow: 'Magliette da rimorchio · stampate su richiesta',
    heroA: 'La frase giusta,', heroB: 'addosso.',
    heroSub: 'Se non hai il coraggio di dirla, indossala. Magliette ironiche per chi rimorchia con stile, o almeno ci prova.',
    shopUomo: 'Shop Uomo', shopDonna: 'Shop Donna',
    perks: ['Stampata su richiesta', 'Spedizione 3–7 giorni', 'Ristampa gratis se difettosa'],
    napkin: 'Scritta sul tovagliolo', another: "Un'altra", lineN: (n, t) => `Frase n° ${n} di ${t}`,
    featured: 'La più sfacciata', buyIt: 'Comprala',
    designs: (n) => `${n} design`,
    houseTitle: 'Le frasi della casa', houseSub: 'Tutti i design del negozio. Ogni maglietta parte in stampa solo quando la ordini.',
    how: [
      ['Scegli la frase', 'Ogni design ha il suo livello di sfacciataggine, da 1 a 5. Regolati con la serata.'],
      ['La stampiamo per te', 'Stampa diretta su cotone di qualità, fatta da Printful quando arriva il tuo ordine.'],
      ['Arriva a casa', 'Spedizione in Italia e in Europa in 3–7 giorni lavorativi, con tracciamento.'],
    ],
    howTitle: 'Come funziona',
    soon: 'Nuove frasi in arrivo.',
    soldOut: 'Esaurita', hot: 'Piccante', spice: 'Sfacciataggine', spiceOf: (n) => `Sfacciataggine ${n} su 5`,
    tee: 'maglietta', colors: { White: 'bianca', Black: 'nera' },
    size: 'Taglia', fit: (donna) => `vestibilità ${donna ? 'unisex' : 'uomo'}`,
    addToBill: 'Aggiungi al conto', chooseSize: 'Scegli una taglia',
    added: (name, size) => `${name} (${size}) aggiunta al conto`,
    retired: 'Questa base non è più disponibile su Printful. Torna presto: la stiamo spostando su una maglietta nuova.',
    specs: { tee: 'Maglietta', color: 'Colore', print: 'Stampa', ship: 'Spedizione' },
    printVal: 'Diretta su tessuto (DTG)', shipVal: '3–7 giorni lavorativi',
    returns: 'Stampata su richiesta: per questo non accettiamo resi per cambio idea, ma se arriva difettosa la ristampiamo gratis.',
    pairWith: 'Abbinala con', front: 'Sulla maglietta', art: 'La grafica',
    emptyBillTitle: 'Il conto è vuoto.', emptyBillSub: 'Scegli prima una frase.', backToShop: 'Torna al negozio',
    who: 'Chi la indossa', where: 'Dove spediamo',
    f: { name: 'Nome e cognome', email: 'Email', phone: 'Telefono (per il corriere)', address: 'Indirizzo', city: 'Città', zip: 'CAP', province: 'Provincia', country: 'Paese', note: 'Note (facoltative)' },
    countries: { IT: 'Italia', SM: 'San Marino', CH: 'Svizzera', FR: 'Francia', DE: 'Germania', ES: 'Spagna', AT: 'Austria' },
    payNotice: 'Il pagamento online arriva a breve. Per ora ricevi una conferma e ti scriviamo noi per pagare prima della stampa.',
    send: (t) => `Invia l'ordine · ${t}`, sending: 'Invio in corso…',
    fixFields: 'Compila i campi evidenziati.', fixEmail: "Controlla l'email: manca qualcosa.",
    sendFail: (m) => `L'ordine non è partito: ${m}. Riprova tra poco.`,
    received: 'Ordine ricevuto', thanksTitle: 'Ci sai fare.',
    thanksSub: 'Abbiamo ricevuto il tuo ordine. Ti scriviamo a breve per il pagamento, poi la maglietta va in stampa.',
    lostTitle: "Qui non c'è nessuno.", lostSub: 'Forse ti sei perso nei suoi occhi.',
    closedTitle: 'Il bancone è chiuso.', closedSub: 'Non riusciamo a caricare le magliette. Ricarica la pagina tra poco.',
    nothingYet: 'Ancora niente.', fillsUp: 'Il conto si riempie quando scegli una frase.', seeTees: 'Guarda le magliette',
    table: (d) => `Tavolo 69 · ${d}`, sizeColor: (s, c) => `Taglia ${s} · ${c}`,
    removeOne: 'Togli uno', addOne: 'Aggiungi uno', remove: 'Togli',
    tees: 'Magliette', shipping: 'Spedizione', onConfirm: 'alla conferma', total: 'Totale', checkout: 'Vai alla cassa',
    previewId: 'ANTEPRIMA',
  },
  en: {
    skip: 'Skip to content',
    announce: 'Printed on demand · Shipping to Italy and Europe in 3–7 business days',
    home: 'Your Favorite Daddy Shop, home', sections: 'Sections', language: 'Language',
    uomo: 'Men', donna: 'Women', tutte: 'All',
    cart: 'Cart', openCart: 'Open the cart', closeCart: 'Close the cart', bill: 'Your bill',
    footText: 'Every tee is printed on demand by Printful and shipped in 3–7 business days. No warehouse, no waste, just lines that work (almost always).',
    footSmall: 'Wear these lines with a wink. Consent is no joke.',
    lines: [
      'Call me daddy.',
      "Who's your daddy tonight?",
      "Tired? You've been running through my mind all night.",
      'Do you believe in love at first sight, or should I walk by again?',
      "I'm no photographer, but I can picture us together.",
      "Can I borrow a kiss? I'll give it back.",
      'Got a map? I just got lost in your eyes.',
      'Is your dad a thief? He stole the stars and put them in your eyes.',
    ],
    sec: {
      uomo: { title: 'Men', sub: 'For the guy who walks in and the night changes.' },
      donna: { title: 'Women', sub: 'For the one who says the line first. And wins.' },
      tutte: { title: 'All', sub: 'Every design in the shop. Each tee goes to print only when you order it.' },
    },
    eyebrow: 'Pickup-line tees · printed on demand',
    heroA: 'The right line,', heroB: 'worn.',
    heroSub: "If you don't dare say it, wear it. Cheeky tees for people who flirt with style, or at least give it a shot.",
    shopUomo: 'Shop Men', shopDonna: 'Shop Women',
    perks: ['Printed on demand', 'Ships in 3–7 days', 'Free reprint if faulty'],
    napkin: 'Written on a napkin', another: 'Another one', lineN: (n, t) => `Line ${n} of ${t}`,
    featured: 'The boldest one', buyIt: 'Get it',
    designs: (n) => `${n} design${n === 1 ? '' : 's'}`,
    houseTitle: 'House lines', houseSub: 'Every design in the shop. Each tee goes to print only when you order it.',
    how: [
      ['Pick the line', 'Every design has its own boldness level, from 1 to 5. Match it to the night.'],
      ['We print it for you', 'Direct-to-garment print on quality cotton, made by Printful when your order comes in.'],
      ['It lands at your door', 'Shipping to Italy and Europe in 3–7 business days, with tracking.'],
    ],
    howTitle: 'How it works',
    soon: 'New lines coming soon.',
    soldOut: 'Sold out', hot: 'Spicy', spice: 'Boldness', spiceOf: (n) => `Boldness ${n} of 5`,
    tee: 'tee', colors: { White: 'white', Black: 'black' },
    size: 'Size', fit: (donna) => `${donna ? 'unisex' : "men's"} fit`,
    addToBill: 'Add to bill', chooseSize: 'Pick a size',
    added: (name, size) => `${name} (${size}) added to your bill`,
    retired: "This blank is no longer available on Printful. Check back soon: we're moving it to a new tee.",
    specs: { tee: 'Tee', color: 'Color', print: 'Print', ship: 'Shipping' },
    printVal: 'Direct to garment (DTG)', shipVal: '3–7 business days',
    returns: "Printed on demand, so we don't take returns for a change of heart, but if it arrives faulty we reprint it for free.",
    pairWith: 'Pair it with', front: 'On the tee', art: 'The artwork',
    emptyBillTitle: 'Your bill is empty.', emptyBillSub: 'Pick a line first.', backToShop: 'Back to the shop',
    who: "Who's wearing it", where: 'Where we ship',
    f: { name: 'Full name', email: 'Email', phone: 'Phone (for the courier)', address: 'Address', city: 'City', zip: 'Postcode', province: 'Province / State', country: 'Country', note: 'Notes (optional)' },
    countries: { IT: 'Italy', SM: 'San Marino', CH: 'Switzerland', FR: 'France', DE: 'Germany', ES: 'Spain', AT: 'Austria' },
    payNotice: "Online payment is coming soon. For now you get a confirmation and we'll message you to pay before printing.",
    send: (t) => `Place order · ${t}`, sending: 'Sending…',
    fixFields: 'Fill in the highlighted fields.', fixEmail: 'Check your email: something is missing.',
    sendFail: (m) => `The order didn't go through: ${m}. Try again in a moment.`,
    received: 'Order received', thanksTitle: "You've got moves.",
    thanksSub: "We got your order. We'll message you shortly about payment, then your tee goes to print.",
    lostTitle: 'Nobody here.', lostSub: 'Maybe you got lost in their eyes.',
    closedTitle: 'The bar is closed.', closedSub: "We can't load the tees right now. Reload the page in a moment.",
    nothingYet: 'Nothing yet.', fillsUp: 'Your bill fills up when you pick a line.', seeTees: 'See the tees',
    table: (d) => `Table 69 · ${d}`, sizeColor: (s, c) => `Size ${s} · ${c}`,
    removeOne: 'Remove one', addOne: 'Add one', remove: 'Remove',
    tees: 'Tees', shipping: 'Shipping', onConfirm: 'on confirmation', total: 'Total', checkout: 'Checkout',
    previewId: 'PREVIEW',
  },
};

const LOCALE = { it: 'it-IT', en: 'en-IE' };
let lang = store.get('yfd-lang', null) || ((navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en');
if (!TEXT[lang]) lang = 'it';
const T = () => TEXT[lang];
const eur = (n) => new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: 'EUR' }).format(n);

let catalog = { products: [] };
let cart = store.get('yfd-cart', []);

const shown = () => catalog.products.filter((p) => !p.unnamed);
const byId = (id) => catalog.products.find((p) => p.id === id);
const bySlug = (slug) => catalog.products.find((p) => p.slug === slug);
const inSection = (s) => shown().filter((p) => s === 'tutte' || p.sections.includes(s));
const sizeOf = (p, size) => p?.sizes.find((s) => s.size === size);
const nameOf = (p) => (lang === 'en' && p.en?.traduzione) || p.name;
const lineOf = (p) => (lang === 'en' && p.en?.frase) || p.tagline || '';
const colorOf = (p) => T().colors[p.color] || p.color;
const altOf = (p) => `${nameOf(p)}, ${T().tee} ${colorOf(p)}`;

/* ---------- Immagini: mockup o maglietta disegnata ---------- */
function isDark(hex) {
  const h = (hex || '#fff').replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
function teeSvg(p) {
  const dark = isDark(p.colorHex);
  const words = nameOf(p).toUpperCase().split(/\s+/);
  const rows = []; let row = '';
  for (const w of words) { if ((row + ' ' + w).trim().length > 10 && row) { rows.push(row); row = w; } else row = (row + ' ' + w).trim(); }
  if (row) rows.push(row);
  const fs = rows.length > 3 ? 24 : 30;
  const y0 = 230 - ((rows.length - 1) * fs * 1.05) / 2;
  const text = rows.map((r, i) => `<tspan x="200" y="${y0 + i * fs * 1.05}">${esc(r)}</tspan>`).join('');
  return `<svg class="tee-svg" viewBox="0 0 400 400" role="img" aria-label="${esc(altOf(p))}">
    <path d="M140 40 L100 52 L40 105 L72 160 L108 140 L108 370 L292 370 L292 140 L328 160 L360 105 L300 52 L260 40 Q200 76 140 40 Z"
      fill="${esc(p.colorHex)}" stroke="${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.14)'}" stroke-width="2"/>
    <text text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="${fs}" fill="${dark ? '#fff4e6' : '#0d0d0d'}">${text}</text>
  </svg>`;
}
const imgTag = (p, src, cls = '', lazy = true) => `<img class="${cls}" src="${esc(src)}" alt="${esc(altOf(p))}" ${lazy ? 'loading="lazy"' : ''} data-fallback="${esc(p.id)}">`;
document.addEventListener('error', (e) => {
  const el = e.target;
  if (el.tagName === 'IMG' && el.dataset.fallback) {
    const p = byId(el.dataset.fallback);
    if (p) el.outerHTML = teeSvg(p);
  }
}, true);

function badge(p) {
  if (!p.available) return `<span class="tag off">${T().soldOut}</span>`;
  if (p.spice >= 5) return `<span class="tag">${T().hot}</span>`;
  return '';
}
const spice = (n) => `<span class="spice" title="${esc(T().spiceOf(n))}"><span class="spice-label">${T().spice}</span>
  <span class="spice-pips" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span><span class="sr">${esc(T().spiceOf(n))}</span></span>`;

const card = (p) => `<a class="card${p.available ? '' : ' is-off'}" href="#/p/${esc(p.slug)}">
  <div class="card-media">
    ${badge(p)}
    ${p.image ? imgTag(p, p.image, 'img-a') : teeSvg(p)}
    ${p.image2 ? imgTag(p, p.image2, 'img-b') : ''}
  </div>
  <div class="card-body">
    <span class="card-name">${esc(nameOf(p))}</span>
    ${lineOf(p) ? `<span class="card-line">${esc(lineOf(p))}</span>` : ''}
    <span class="card-foot"><span class="price">${eur(p.price)}</span>${spice(p.spice)}</span>
  </div>
</a>`;

/* ---------- Pagine ---------- */
function home() {
  const t = T();
  const star = shown().find((p) => p.available) || shown()[0];
  return `
  <section class="hero">
    <div class="hero-copy">
      <p class="eyebrow">${t.eyebrow}</p>
      <h1>${t.heroA} <em>${t.heroB}</em></h1>
      <p class="hero-sub">${t.heroSub}</p>
      <div class="cta">
        <a class="btn hot" href="#/uomo">${t.shopUomo}</a>
        <a class="btn ghost" href="#/donna">${t.shopDonna}</a>
      </div>
      <ul class="perks">${t.perks.map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>
    ${star ? `<div class="hero-visual">
      <a class="hero-shot" href="#/p/${esc(star.slug)}">
        ${star.image ? imgTag(star, star.image, '', false) : teeSvg(star)}
        <span class="hero-price"><span><small>${t.featured}</small>${esc(nameOf(star))}</span><b>${eur(star.price)} · ${t.buyIt}</b></span>
      </a>
      <div class="napkin" aria-live="polite">
        <p class="napkin-eyebrow">${t.napkin}</p>
        <p class="napkin-line" id="napkin-line">${esc(t.lines[0])}</p>
        <div class="napkin-foot"><span id="napkin-n">${t.lineN(1, t.lines.length)}</span><button type="button" id="napkin-next">${t.another}</button></div>
      </div>
    </div>` : ''}
  </section>

  <section class="split" aria-label="${esc(t.sections)}">
    ${['uomo', 'donna'].map((s) => {
      const fav = { uomo: 'ci-vedo-bene', donna: 'presti-un-bacio' }[s];
      const pick = inSection(s).find((p) => p.slug === fav && p.image) || inSection(s).find((p) => p.available && p.image);
      return `<a href="#/${s}" class="split-${s}">
        ${pick ? `<img src="${esc(pick.image)}" alt="" loading="lazy">` : ''}
        <span class="split-text"><span class="count">${t.designs(inSection(s).length)}</span><span class="big">${t.sec[s].title}</span><span class="sub">${t.sec[s].sub}</span><span class="arrow" aria-hidden="true">→</span></span>
      </a>`;
    }).join('')}
  </section>

  <section class="block">
    <div class="sec-head"><h2>${t.houseTitle}</h2><p>${t.houseSub}</p></div>
    <div class="grid">${shown().map(card).join('')}</div>
  </section>

  <section class="how" aria-labelledby="how-title">
    <h2 id="how-title">${t.howTitle}</h2>
    <ol>${t.how.map(([a, b], i) => `<li><span class="how-n">0${i + 1}</span><strong>${a}</strong><p>${b}</p></li>`).join('')}</ol>
  </section>`;
}

function section(s) {
  const t = T(); const list = inSection(s);
  return `
  <section class="page-head">
    <p class="eyebrow">${t.designs(list.length)}</p>
    <h1>${t.sec[s].title}</h1>
    <p>${t.sec[s].sub}</p>
  </section>
  <section class="block">${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<p class="note">${t.soon}</p>`}</section>`;
}

function product(slug) {
  const t = T(); const p = bySlug(slug);
  if (!p || p.unnamed) return notFound();
  const sec = p.sections[0];
  const first = p.sizes.findIndex((x) => x.inStock !== false);
  const sizes = p.sizes.map((s, i) => `<label><input type="radio" name="size" value="${esc(s.size)}" ${s.inStock === false ? 'disabled' : ''} ${i === first ? 'checked' : ''}><span>${esc(s.size)}</span></label>`).join('');
  const others = shown().filter((x) => x.id !== p.id && x.available && x.sections.some((s) => p.sections.includes(s))).slice(0, 4);
  const shots = [[p.image, t.front], [p.image2, t.art]].filter(([src]) => src);
  return `
  <section class="product">
    <div class="gallery">
      <div class="gallery-main">${badge(p)}${shots.length ? imgTag(p, shots[0][0], '', false) : teeSvg(p)}</div>
      ${shots.length > 1 ? `<div class="thumbs" role="group">${shots.map(([src, label], i) => `<button type="button" data-shot="${esc(src)}" aria-label="${esc(label)}" ${i === 0 ? 'aria-pressed="true"' : 'aria-pressed="false"'}><img src="${esc(src)}" alt=""></button>`).join('')}</div>` : ''}
    </div>
    <div class="product-info">
      <p class="crumbs"><a href="#/${sec}">${t.sec[sec].title}</a> / ${esc(nameOf(p))}</p>
      <h1>${esc(nameOf(p))}</h1>
      ${lineOf(p) ? `<p class="tagline">${esc(lineOf(p))}</p>` : ''}
      <div class="pdp-row"><p class="price big" id="pdp-price">${eur(p.sizes[first]?.price ?? p.price)}</p>${spice(p.spice)}</div>
      ${p.available ? `
      <form id="add-form">
        <div class="field-label">${t.size} <span>${t.fit(p.sections.includes('donna'))}</span></div>
        <fieldset class="sizes"><legend class="sr">${t.size}</legend>${sizes}</fieldset>
        <button class="btn hot wide" type="submit">${t.addToBill}</button>
      </form>` : `<p class="notice">${t.retired}</p>`}
      <ul class="perks small">${t.perks.map((x) => `<li>${x}</li>`).join('')}</ul>
      <dl class="specs">
        <div><dt>${t.specs.tee}</dt><dd>${esc(p.blank?.title || '')}</dd></div>
        <div><dt>${t.specs.color}</dt><dd>${esc(colorOf(p))}</dd></div>
        <div><dt>${t.specs.print}</dt><dd>${t.printVal}</dd></div>
        <div><dt>${t.specs.ship}</dt><dd>${t.shipVal}</dd></div>
      </dl>
      <p class="note">${t.returns}</p>
    </div>
  </section>
  ${others.length ? `<section class="block"><div class="sec-head"><h2>${t.pairWith}</h2></div><div class="grid">${others.map(card).join('')}</div></section>` : ''}`;
}

function checkout() {
  const t = T();
  if (!cart.length) return `<section class="thanks"><h1>${t.emptyBillTitle}</h1><p>${t.emptyBillSub}</p><a class="btn hot" href="#/">${t.backToShop}</a></section>`;
  const c = store.get('yfd-customer', {});
  const v = (k) => esc(c[k] || '');
  const f = (id, label, attrs, cls = '') => `<div class="f ${cls}"><label for="c-${id}">${label}</label><input id="c-${id}" name="${id}" ${attrs} value="${v(id)}"></div>`;
  return `
  <section class="checkout">
    <form class="form" id="checkout-form" novalidate>
      <h2>${t.who}</h2>
      ${f('name', t.f.name, 'autocomplete="name" required', 'half')}
      ${f('email', t.f.email, 'type="email" autocomplete="email" required', 'half')}
      ${f('phone', t.f.phone, 'type="tel" autocomplete="tel"')}
      <h2>${t.where}</h2>
      ${f('address', t.f.address, 'autocomplete="street-address" required')}
      ${f('city', t.f.city, 'autocomplete="address-level2" required', 'third')}
      ${f('zip', t.f.zip, 'autocomplete="postal-code" required', 'third')}
      ${f('province', t.f.province, 'autocomplete="address-level1" maxlength="2" placeholder="MI"', 'third')}
      <div class="f"><label for="c-country">${t.f.country}</label>
        <select id="c-country" name="country" autocomplete="country">
          ${Object.entries(t.countries).map(([k, n]) => `<option value="${k}" ${(c.country || 'IT') === k ? 'selected' : ''}>${n}</option>`).join('')}
        </select></div>
      <div class="f"><label for="c-note">${t.f.note}</label><textarea id="c-note" name="note" rows="2">${v('note')}</textarea></div>
      <p class="errors" id="errors" role="alert"></p>
      <p class="notice">${t.payNotice}</p>
      <button class="btn hot wide" type="submit">${t.send(eur(total()))}</button>
    </form>
    <div class="checkout-side">${receipt(false)}</div>
  </section>`;
}

function thanks(id) {
  const t = T();
  return `<section class="thanks">
    <p class="eyebrow">${t.received}</p>
    <h1>${t.thanksTitle}</h1>
    <p>${t.thanksSub}</p>
    <p class="order-id">${esc(id)}</p>
    <a class="btn ghost" href="#/">${t.backToShop}</a>
  </section>`;
}
const notFound = () => `<section class="thanks"><h1>${T().lostTitle}</h1><p>${T().lostSub}</p><a class="btn hot" href="#/">${T().backToShop}</a></section>`;

/* ---------- Carrello ---------- */
const total = () => cart.reduce((n, i) => n + (sizeOf(byId(i.productId), i.size)?.price ?? 0) * i.qty, 0);
const count = () => cart.reduce((n, i) => n + i.qty, 0);
function saveCart(bump = true) {
  cart = cart.filter((i) => byId(i.productId) && i.qty > 0);
  store.set('yfd-cart', cart);
  const el = $('#cart-count');
  el.textContent = count();
  el.toggleAttribute('data-empty', !count());
  if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function receipt(editable) {
  const t = T();
  if (!cart.length) return `<div class="empty"><p class="empty-title">${t.nothingYet}</p><p class="note">${t.fillsUp}</p><a class="btn hot" href="#/tutte" data-close>${t.seeTees}</a></div>`;
  const lines = cart.map((i, idx) => {
    const p = byId(i.productId); const s = sizeOf(p, i.size);
    return `<div class="line">
      ${editable ? `<span class="line-thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : ''}</span>` : ''}
      <span class="line-main">
        <span class="line-top"><span class="line-name">${esc(nameOf(p))}</span><span>${eur(s.price * i.qty)}</span></span>
        <span class="line-meta">${t.sizeColor(esc(i.size), esc(colorOf(p)))}${editable ? '' : ` · ×${i.qty}`}</span>
        ${editable ? `<span class="line-actions"><span class="qty"><button type="button" data-qty="${idx}" data-d="-1" aria-label="${t.removeOne}">−</button><output>${i.qty}</output><button type="button" data-qty="${idx}" data-d="1" aria-label="${t.addOne}">+</button></span>
        <button class="remove" type="button" data-remove="${idx}">${t.remove}</button></span>` : ''}
      </span>
    </div>`;
  }).join('');
  return `<div class="receipt">
    <div class="receipt-head">Your Favorite Daddy Shop<br>${t.table(new Date().toLocaleDateString(LOCALE[lang]))}</div>
    ${lines}
    <div class="totals">
      <div><span>${t.tees}</span><span>${count()}</span></div>
      <div><span>${t.shipping}</span><span>${t.onConfirm}</span></div>
      <div class="grand"><span>${t.total}</span><span>${eur(total())}</span></div>
    </div>
  </div>
  ${editable ? `<a class="btn hot wide" href="#/checkout" data-close>${t.checkout} · ${eur(total())}</a>` : ''}`;
}
let lastFocus = null;
function openCart() {
  lastFocus = document.activeElement;
  $('#drawer-body').innerHTML = receipt(true);
  $('#drawer').hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => $('#drawer').classList.add('open'));
  $('.drawer-panel .icon-btn').focus();
}
function closeCart() {
  $('#drawer').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { $('#drawer').hidden = true; }, 220);
  lastFocus?.focus?.();
}
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------- Lingua ---------- */
function applyLang() {
  const t = T();
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach((el) => { const v = t[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t[el.dataset.i18nLabel]));
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#ticker').innerHTML = [...t.lines, ...t.lines].map((l) => `<span>${esc(l)}</span>`).join('');
}

/* ---------- Router ---------- */
function render() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [route, arg] = hash.split('/');
  const main = $('#main');
  let html;
  if (!route) html = home();
  else if (T().sec[route]) html = section(route);
  else if (route === 'p') html = product(decodeURIComponent(arg || ''));
  else if (route === 'checkout') html = checkout();
  else if (route === 'grazie') html = thanks(decodeURIComponent(arg || ''));
  else html = notFound();
  main.innerHTML = html;
  const current = route === 'p' ? bySlug(decodeURIComponent(arg || ''))?.sections[0] : route;
  $$('[data-nav]').forEach((a) => (a.dataset.nav === current ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  bindPage(route, arg);
}

function bindPage(route, arg) {
  const t = T();
  if (!route) {
    let n = 0;
    $('#napkin-next')?.addEventListener('click', () => {
      n = (n + 1) % t.lines.length;
      const line = $('#napkin-line');
      line.classList.remove('swap'); void line.offsetWidth; line.classList.add('swap');
      line.textContent = t.lines[n];
      $('#napkin-n').textContent = t.lineN(n + 1, t.lines.length);
    });
  }
  if (route === 'p') {
    const p = bySlug(decodeURIComponent(arg));
    $$('[data-shot]').forEach((b) => b.addEventListener('click', () => {
      const img = $('.gallery-main img');
      if (img) img.src = b.dataset.shot;
      $$('[data-shot]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    const form = $('#add-form');
    if (!p || !form) return;
    const price = () => { $('#pdp-price').textContent = eur(sizeOf(p, form.size.value)?.price ?? p.price); };
    form.addEventListener('change', price);
    price();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const size = form.size.value;
      if (!size) return toast(t.chooseSize);
      const line = cart.find((i) => i.productId === p.id && i.size === size);
      if (line) line.qty++; else cart.push({ productId: p.id, size, qty: 1 });
      saveCart();
      toast(t.added(nameOf(p), size));
      openCart();
    });
  }
  if (route === 'checkout') {
    const form = $('#checkout-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const missing = $$('[required]', form).filter((el) => !el.value.trim());
      $$('input', form).forEach((el) => el.removeAttribute('aria-invalid'));
      missing.forEach((el) => el.setAttribute('aria-invalid', 'true'));
      const emailBad = data.email && !/^\S+@\S+\.\S+$/.test(data.email);
      if (emailBad) $('#c-email').setAttribute('aria-invalid', 'true');
      if (missing.length || emailBad) {
        $('#errors').textContent = missing.length ? t.fixFields : t.fixEmail;
        (missing[0] || $('#c-email')).focus();
        return;
      }
      store.set('yfd-customer', data);
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = t.sending;
      try {
        let id;
        if (PREVIEW) id = `${t.previewId}-${Date.now().toString(36).toUpperCase()}`;
        else {
          const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: { ...data, lang }, items: cart }) });
          const out = await res.json();
          if (!res.ok) throw new Error((out.errors || [out.error]).join('. '));
          id = out.id;
        }
        cart = []; saveCart(false);
        location.hash = `#/grazie/${encodeURIComponent(id)}`;
      } catch (err) {
        $('#errors').textContent = t.sendFail(err.message);
        btn.disabled = false; btn.textContent = t.send(eur(total()));
      }
    });
  }
}

/* ---------- Avvio ---------- */
async function start() {
  applyLang();
  try {
    catalog = window.__CATALOG__ || await (await fetch('/api/catalog')).json();
  } catch {
    $('#main').innerHTML = `<section class="thanks"><h1>${T().closedTitle}</h1><p>${T().closedSub}</p></section>`;
    return;
  }
  saveCart(false);
  $('#cart-btn').addEventListener('click', openCart);
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang; store.set('yfd-lang', lang);
    applyLang(); render();
    if (!$('#drawer').hidden) $('#drawer-body').innerHTML = receipt(true);
  }));
  $('#drawer').addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]'); const r = e.target.closest('[data-remove]');
    if (q) { const i = cart[+q.dataset.qty]; i.qty = Math.max(1, Math.min(20, i.qty + +q.dataset.d)); saveCart(); $('#drawer-body').innerHTML = receipt(true); }
    else if (r) { cart.splice(+r.dataset.remove, 1); saveCart(); $('#drawer-body').innerHTML = receipt(true); }
    else if (e.target.closest('[data-close]')) closeCart();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#drawer').hidden) closeCart(); });
  window.addEventListener('hashchange', () => {
    render();
    window.scrollTo(0, 0);
    if (location.hash.replace(/^#\/?/, '')) $('#main').focus({ preventScroll: true });
  });
  render();
}
start();
