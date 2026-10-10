// Your Favorite Daddy Shop: vetrina, prodotto, carrello, cassa con pagamento Stripe, in italiano e in inglese.
// Funziona con il server (API /api/...) oppure in anteprima statica con window.__CATALOG__ e window.__PREVIEW__ = true.

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
    skip: 'Vai al contenuto', home: 'Your Favorite Daddy Shop, home', sections: 'Sezioni', language: 'Lingua',
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
    napkin: 'Scritta sul tovagliolo', another: "Un'altra", lineN: (n, t) => `Frase n° ${n} di ${t}`,
    drag: 'Trascinala per girarla', buyIt: 'Comprala', pick: (n) => `Mostra ${n} in 3D`,
    designs: (n) => `${n} design`, discover: 'Guarda la sezione',
    couplesTitle: 'Coppie che ci provano', couplesSub: 'Lui la dice, lei risponde. O viceversa. Le frasi della casa addosso a chi ci prova davvero.',
    houseTitle: 'Le frasi della casa', houseSub: 'Tutti i design del negozio. Ogni maglietta parte in stampa solo quando la ordini.',
    howTitle: 'Come funziona',
    how: [
      ['Scegli la frase', 'Ogni design ha il suo livello di sfacciataggine, da 1 a 5. Regolati con la serata.'],
      ['La stampiamo per te', 'Stampa diretta su cotone di qualità, fatta da Printful quando arriva il tuo ordine.'],
      ['Arriva a casa', 'Spedizione in Italia e in Europa in 3–7 giorni lavorativi, con tracciamento.'],
    ],
    soon: 'Nuove frasi in arrivo.',
    soldOut: 'Esaurita', hot: 'Piccante', backPrint: 'Fronte e retro', spice: 'Sfacciataggine', spiceOf: (n) => `Sfacciataggine ${n} su 5`,
    tee: 'maglietta', colors: { White: 'bianca', Black: 'nera' },
    size: 'Taglia', fit: 'vestibilità unisex',
    addToBill: 'Aggiungi al conto', chooseSize: 'Scegli una taglia',
    added: (size) => `Aggiunta al conto (taglia ${size})`,
    specs: { tee: 'Maglietta', color: 'Colore', print: 'Stampa', ship: 'Spedizione' },
    printVal: 'Diretta su tessuto (DTG)', printBoth: 'Davanti e dietro (DTG)', shipVal: '3–7 giorni lavorativi',
    returns: 'Stampata su richiesta: per questo non accettiamo resi per cambio idea, ma se arriva difettosa la ristampiamo gratis.',
    pairWith: 'Abbinala con', meaning: 'Tradotto:',
    views: { 'flat-front': 'Davanti', 'couple-front': 'In coppia', 'men-s-lifestyle-front': 'Su di lui', 'women-s-lifestyle-front': 'Su di lei', 'flat-back': 'Dietro', 'couple-back': 'Dietro, in coppia', 'women-s-lifestyle-back': 'Dietro, su di lei' },
    view3d: 'Girala in 3D',
    emptyBillTitle: 'Il conto è vuoto.', emptyBillSub: 'Scegli prima una frase.', backToShop: 'Torna al negozio',
    who: 'Chi la indossa', where: 'Dove spediamo',
    f: { name: 'Nome e cognome', email: 'Email', phone: 'Telefono (per il corriere)', address: 'Indirizzo', city: 'Città', zip: 'CAP', province: 'Provincia', country: 'Paese', note: 'Note (facoltative)' },
    countries: { IT: 'Italia', SM: 'San Marino', CH: 'Svizzera', FR: 'Francia', DE: 'Germania', ES: 'Spagna', AT: 'Austria', BE: 'Belgio', NL: 'Paesi Bassi', PT: 'Portogallo', IE: 'Irlanda', GB: 'Regno Unito' },
    pay: (t) => `Paga in sicurezza · ${t}`, send: (t) => `Invia l'ordine · ${t}`, sending: 'Un attimo…',
    payNote: 'Paghi con carta, Apple Pay o Google Pay sulla pagina sicura di Stripe. La maglietta va in stampa appena il pagamento è confermato.',
    noPayNote: 'Il pagamento online arriva a breve. Per ora ricevi una conferma e ti scriviamo noi per pagare prima della stampa.',
    previewNote: 'Anteprima: il pagamento è simulato, nessun addebito.',
    fixFields: 'Compila i campi evidenziati.', fixEmail: "Controlla l'email: manca qualcosa.",
    sendFail: (m) => `L'ordine non è partito: ${m}. Riprova tra poco.`,
    received: 'Ordine ricevuto', paidLabel: 'Pagamento ricevuto', thanksTitle: 'Ci sai fare.',
    thanksSub: 'Abbiamo ricevuto il tuo ordine. Ti scriviamo a breve per il pagamento, poi la maglietta va in stampa.',
    thanksPaid: 'Pagamento confermato: la tua maglietta va in stampa. Ti arriva una mail con il tracciamento appena parte.',
    checking: 'Sto controllando il pagamento…',
    lostTitle: "Qui non c'è nessuno.", lostSub: 'Forse ti sei perso nei suoi occhi.',
    closedTitle: 'Il bancone è chiuso.', closedSub: 'Non riusciamo a caricare le magliette. Ricarica la pagina tra poco.',
    nothingYet: 'Ancora niente.', fillsUp: 'Il conto si riempie quando scegli una frase.', seeTees: 'Guarda le magliette',
    table: (d) => `Tavolo 69 · ${d}`, sizeColor: (s, c) => `Taglia ${s} · ${c}`,
    removeOne: 'Togli uno', addOne: 'Aggiungi uno', remove: 'Togli',
    tees: 'Magliette', shipping: 'Spedizione', shipEst: 'da 4,49 € (alla cassa)', shipDays: (a, b) => `consegna in ${a}–${b} giorni`,
    total: 'Totale', checkout: 'Vai alla cassa', previewId: 'ANTEPRIMA',
  },
  en: {
    skip: 'Skip to content', home: 'Your Favorite Daddy Shop, home', sections: 'Sections', language: 'Language',
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
    napkin: 'Written on a napkin', another: 'Another one', lineN: (n, t) => `Line ${n} of ${t}`,
    drag: 'Drag to spin it', buyIt: 'Get it', pick: (n) => `Show ${n} in 3D`,
    designs: (n) => `${n} design${n === 1 ? '' : 's'}`, discover: 'See the section',
    couplesTitle: 'Couples who go for it', couplesSub: 'One says the line, the other answers. The house lines, worn by people who actually try.',
    houseTitle: 'House lines', houseSub: 'Every design in the shop. Each tee goes to print only when you order it.',
    howTitle: 'How it works',
    how: [
      ['Pick the line', 'Every design has its own boldness level, from 1 to 5. Match it to the night.'],
      ['We print it for you', 'Direct-to-garment print on quality cotton, made by Printful when your order comes in.'],
      ['It lands at your door', 'Shipping to Italy and Europe in 3–7 business days, with tracking.'],
    ],
    soon: 'New lines coming soon.',
    soldOut: 'Sold out', hot: 'Spicy', backPrint: 'Front and back', spice: 'Boldness', spiceOf: (n) => `Boldness ${n} of 5`,
    tee: 'tee', colors: { White: 'white', Black: 'black' },
    size: 'Size', fit: 'unisex fit',
    addToBill: 'Add to bill', chooseSize: 'Pick a size',
    added: (size) => `Added to your bill (size ${size})`,
    specs: { tee: 'Tee', color: 'Color', print: 'Print', ship: 'Shipping' },
    printVal: 'Direct to garment (DTG)', printBoth: 'Front and back (DTG)', shipVal: '3–7 business days',
    returns: "Printed on demand, so we don't take returns for a change of heart, but if it arrives faulty we reprint it for free.",
    pairWith: 'Pair it with', meaning: '',
    views: { 'flat-front': 'Front', 'couple-front': 'As a couple', 'men-s-lifestyle-front': 'On him', 'women-s-lifestyle-front': 'On her', 'flat-back': 'Back', 'couple-back': 'Back, as a couple', 'women-s-lifestyle-back': 'Back, on her' },
    view3d: 'Spin it in 3D',
    emptyBillTitle: 'Your bill is empty.', emptyBillSub: 'Pick a line first.', backToShop: 'Back to the shop',
    who: "Who's wearing it", where: 'Where we ship',
    f: { name: 'Full name', email: 'Email', phone: 'Phone (for the courier)', address: 'Address', city: 'City', zip: 'Postcode', province: 'Province / State', country: 'Country', note: 'Notes (optional)' },
    countries: { IT: 'Italy', SM: 'San Marino', CH: 'Switzerland', FR: 'France', DE: 'Germany', ES: 'Spain', AT: 'Austria', BE: 'Belgium', NL: 'Netherlands', PT: 'Portugal', IE: 'Ireland', GB: 'United Kingdom' },
    pay: (t) => `Pay securely · ${t}`, send: (t) => `Place order · ${t}`, sending: 'One moment…',
    payNote: 'Pay by card, Apple Pay or Google Pay on the secure Stripe page. Your tee goes to print as soon as payment is confirmed.',
    noPayNote: "Online payment is coming soon. For now you get a confirmation and we'll message you to pay before printing.",
    previewNote: 'Preview: payment is simulated, nothing is charged.',
    fixFields: 'Fill in the highlighted fields.', fixEmail: 'Check your email: something is missing.',
    sendFail: (m) => `The order didn't go through: ${m}. Try again in a moment.`,
    received: 'Order received', paidLabel: 'Payment received', thanksTitle: "You've got moves.",
    thanksSub: "We got your order. We'll message you shortly about payment, then your tee goes to print.",
    thanksPaid: "Payment confirmed: your tee is going to print. You'll get an email with tracking as soon as it ships.",
    checking: 'Checking your payment…',
    lostTitle: 'Nobody here.', lostSub: 'Maybe you got lost in their eyes.',
    closedTitle: 'The bar is closed.', closedSub: "We can't load the tees right now. Reload the page in a moment.",
    nothingYet: 'Nothing yet.', fillsUp: 'Your bill fills up when you pick a line.', seeTees: 'See the tees',
    table: (d) => `Table 69 · ${d}`, sizeColor: (s, c) => `Size ${s} · ${c}`,
    removeOne: 'Remove one', addOne: 'Add one', remove: 'Remove',
    tees: 'Tees', shipping: 'Shipping', shipEst: 'from €4.49 (at checkout)', shipDays: (a, b) => `delivery in ${a}–${b} days`,
    total: 'Total', checkout: 'Checkout', previewId: 'PREVIEW',
  },
};

const LOCALE = { it: 'it-IT', en: 'en-IE' };
let lang = store.get('yfd-lang', null) || ((navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : 'en');
if (!TEXT[lang]) lang = 'it';
const T = () => TEXT[lang];
const eur = (n) => new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: 'EUR' }).format(n);

let catalog = { products: [] };
let config = { payments: false };
let cart = store.get('yfd-cart', []);
let tee3d = null; // maglietta 3D attiva (una alla volta)

const shown = () => catalog.products;
const byId = (id) => catalog.products.find((p) => p.id === id);
const bySlug = (slug) => catalog.products.find((p) => p.slug === slug);
const inSection = (s) => shown().filter((p) => s === 'tutte' || p.sections.includes(s));
const sizeOf = (p, size) => p?.sizes.find((s) => s.size === size);
const lineOf = (p) => (lang === 'en' ? p.en?.frase : p.it?.frase) || '';
const itOf = (p) => (lang === 'it' ? p.it?.traduzione : '') || '';
const colorOf = (p) => T().colors[p.color] || p.color;
const altOf = (p) => `${p.name} (${T().tee} ${colorOf(p)})`;
const shot = (p, tipo) => p.gallery?.find((src) => src.includes(`/${tipo}.`)) || null;
const firstLine = (s) => (s.match(/^.*?[?.!](?=\s|$)/) || [s])[0];

/* ---------- Pezzi comuni ---------- */
function badge(p) {
  if (!p.available) return `<span class="tag off">${T().soldOut}</span>`;
  return `${p.spice >= 5 ? `<span class="tag">${T().hot}</span>` : ''}${p.back ? `<span class="tag back">${T().backPrint}</span>` : ''}`;
}
const spice = (n) => `<span class="spice" title="${esc(T().spiceOf(n))}">${T().spice}
  <span class="spice-pips" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span><span class="sr">${esc(T().spiceOf(n))}</span></span>`;

const card = (p) => `<a class="card" href="#/p/${esc(p.slug)}">
  <div class="card-media">
    ${badge(p)}
    <img src="${esc(p.image)}" alt="${esc(altOf(p))}" loading="lazy">
    ${p.couple ? `<img class="img-b" src="${esc(p.couple)}" alt="" loading="lazy">` : ''}
  </div>
  <div class="card-body">
    <span class="card-name">${esc(p.name)}</span>
    <span class="price">${eur(p.price)}</span>
    ${itOf(p) ? `<span class="card-it">${esc(itOf(p))}</span>` : ''}
    ${lineOf(p) ? `<span class="card-line">${esc(lineOf(p))}</span>` : ''}
    <span class="card-line">${spice(p.spice)}</span>
  </div>
</a>`;

/* ---------- Pagine ---------- */
function home() {
  const t = T();
  const picks = shown().filter((p) => p.available && p.art).slice(0, 9);
  const star = picks[0];
  const tile = (s) => {
    const photo = inSection(s).map((p) => shot(p, s === 'uomo' ? 'men-s-lifestyle-front' : 'women-s-lifestyle-front')).find(Boolean);
    return `<a href="#/${s}" class="${s}">
      ${photo ? `<img class="split-photo on-dark" src="${esc(photo)}" alt="" loading="lazy">` : ''}
      <span class="count">${t.designs(inSection(s).length)}</span>
      <span class="split-text"><span class="big">${t.sec[s].title}</span><span class="sub">${t.sec[s].sub}</span><span class="cta-line">${t.discover} →</span></span>
    </a>`;
  };
  const couples = shown().filter((p) => p.couple && p.available);
  return `
  <section class="hero">
    <div>
      <p class="eyebrow">${t.eyebrow}</p>
      <h1>${t.heroA} <em>${t.heroB}</em></h1>
      <p class="hero-sub">${t.heroSub}</p>
      <div class="hero-cta">
        <a class="btn hot" href="#/uomo">${t.shopUomo}</a>
        <a class="btn alt" href="#/donna">${t.shopDonna}</a>
      </div>
    </div>
    ${star ? `<div class="hero-visual">
      <div class="stage" id="stage">
        <img class="stage-fallback" src="${esc(star.image)}" alt="${esc(altOf(star))}">
        <div class="stage-price"><span id="stage-name">${esc(star.name)}</span><a id="stage-link" href="#/p/${esc(star.slug)}">${eur(star.price)} · ${t.buyIt} →</a></div>
        <span class="stage-hint">↔ ${t.drag}</span>
      </div>
      <div class="picks" role="group">${picks.map((p, i) => `<button type="button" data-pick="${esc(p.slug)}" aria-pressed="${i === 0}" aria-label="${esc(t.pick(p.name))}"><img src="${esc(p.image)}" alt=""></button>`).join('')}</div>
      <div class="napkin" aria-live="polite">
        <p class="eyebrow">${t.napkin}</p>
        <p class="napkin-line" id="napkin-line">${esc(t.lines[0])}</p>
        <div class="napkin-foot"><span id="napkin-n">${t.lineN(1, t.lines.length)}</span><button type="button" id="napkin-next">${t.another}</button></div>
      </div>
    </div>` : ''}
  </section>

  <section class="split" aria-label="${esc(t.sections)}">${tile('uomo')}${tile('donna')}</section>

  ${couples.length ? `<section aria-labelledby="couples-title">
    <div class="couples-head"><h2 id="couples-title">${t.couplesTitle}</h2><p>${t.couplesSub}</p></div>
    <div class="couples">${couples.map((p) => `<a class="couple" href="#/p/${esc(p.slug)}">
      <img src="${esc(p.couple)}" alt="${esc(altOf(p))}" loading="lazy">
      <span class="bubble">${esc(firstLine(p.name))}</span>
      ${lineOf(p) ? `<span class="bubble reply">${esc(lineOf(p))}</span>` : ''}
      <span class="couple-foot"><strong>${eur(p.price)}</strong><span class="cta-line">${t.buyIt} →</span></span>
    </a>`).join('')}</div>
  </section>` : ''}

  <section>
    <div class="sec-head"><h2>${t.houseTitle}</h2><p>${t.houseSub}</p></div>
    <div class="grid">${shown().map(card).join('')}</div>
  </section>

  <section class="how" aria-label="${esc(t.howTitle)}">
    ${t.how.map(([a, b]) => `<div><strong>${a}</strong><p>${b}</p></div>`).join('')}
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
  <section>${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<p class="note">${t.soon}</p>`}</section>`;
}

function product(slug) {
  const t = T(); const p = bySlug(slug);
  if (!p) return notFound();
  const sec = p.sections.includes(store.get('yfd-sec', '')) ? store.get('yfd-sec', '') : p.sections[0];
  const first = p.sizes.findIndex((x) => x.inStock !== false);
  const sizes = p.sizes.map((s, i) => `<label><input type="radio" name="size" value="${esc(s.size)}" ${s.inStock === false ? 'disabled' : ''} ${i === first ? 'checked' : ''}><span>${esc(s.size)}</span></label>`).join('');
  const others = shown().filter((x) => x.id !== p.id && x.available && x.sections.some((s) => p.sections.includes(s))).slice(0, 4);
  const views = (p.gallery || []).map((src) => [src, t.views[src.split('/').pop().replace('.jpg', '')] || '']);
  return `
  <section class="product">
    <div class="gallery">
      <div class="gallery-main" id="gallery-main">${badge(p)}<img src="${esc(views[0]?.[0] || p.image)}" alt="${esc(altOf(p))}"></div>
      <div class="thumbs" role="group">
        ${views.map(([src, label], i) => `<button type="button" data-shot="${esc(src)}" aria-label="${esc(label)}" aria-pressed="${i === 0}"><img src="${esc(src)}" alt=""></button>`).join('')}
        ${p.art ? `<button type="button" class="t3d" data-3d aria-label="${esc(t.view3d)}" aria-pressed="false">3D</button>` : ''}
      </div>
    </div>
    <div class="product-info">
      <p class="crumbs"><a href="#/${sec}">${t.sec[sec].title}</a> / ${esc(firstLine(p.name))}</p>
      <h1>${esc(p.name)}</h1>
      ${itOf(p) ? `<p class="it-line">${t.meaning} ${esc(itOf(p))}</p>` : ''}
      ${lineOf(p) ? `<p class="tagline">${esc(lineOf(p))}</p>` : ''}
      <div>${spice(p.spice)}</div>
      <p class="price" id="pdp-price">${eur(p.sizes[first]?.price ?? p.price)}</p>
      ${p.available ? `
      <form id="add-form">
        <div class="field-label">${t.size} <span>${t.fit}</span></div>
        <fieldset class="sizes"><legend class="sr">${t.size}</legend>${sizes}</fieldset>
        <div class="hero-cta"><button class="btn hot" type="submit">${t.addToBill}</button></div>
      </form>` : `<p class="notice">${t.soon}</p>`}
      <dl class="specs">
        <div><dt>${t.specs.tee}</dt><dd>${esc(p.blank?.title || '')}</dd></div>
        <div><dt>${t.specs.color}</dt><dd>${esc(colorOf(p))}</dd></div>
        <div><dt>${t.specs.print}</dt><dd>${p.back ? t.printBoth : t.printVal}</dd></div>
        <div><dt>${t.specs.ship}</dt><dd>${t.shipVal}</dd></div>
      </dl>
      <p class="note">${t.returns}</p>
    </div>
  </section>
  ${others.length ? `<section><div class="sec-head"><h2>${t.pairWith}</h2></div><div class="grid">${others.map(card).join('')}</div></section>` : ''}`;
}

function checkout() {
  const t = T();
  if (!cart.length) return `<section class="thanks"><h1>${t.emptyBillTitle}</h1><p>${t.emptyBillSub}</p><a class="btn hot" href="#/">${t.backToShop}</a></section>`;
  const c = store.get('yfd-customer', {});
  const v = (k) => esc(c[k] || '');
  const f = (id, label, attrs, cls = '') => `<div class="f ${cls}"><label for="c-${id}">${label}</label><input id="c-${id}" name="${id}" ${attrs} value="${v(id)}"></div>`;
  const pay = PREVIEW || config.payments;
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
      <p class="notice">${pay ? t.payNote : t.noPayNote}${PREVIEW ? ` ${t.previewNote}` : ''}</p>
      ${pay ? '<div class="pay-badges" aria-hidden="true"><span>VISA</span><span>Mastercard</span><span>Apple Pay</span><span>Google Pay</span><span>Stripe</span></div>' : ''}
      <button class="btn hot" type="submit" id="pay-btn">${(pay ? t.pay : t.send)(eur(total() + (shipQuote?.rate || 0)))}</button>
    </form>
    <div id="checkout-receipt">${receipt(false)}</div>
  </section>`;
}

function thanks(id, sessionId) {
  const t = T();
  return `<section class="thanks">
    <p class="eyebrow" id="thanks-label">${sessionId ? t.checking : t.received}</p>
    <h1>${t.thanksTitle}</h1>
    <p id="thanks-sub">${sessionId || PREVIEW ? t.thanksPaid : t.thanksSub}</p>
    <p class="order-id">${esc(id)}</p>
    <a class="btn alt" href="#/">${t.backToShop}</a>
  </section>`;
}
const notFound = () => `<section class="thanks"><h1>${T().lostTitle}</h1><p>${T().lostSub}</p><a class="btn hot" href="#/">${T().backToShop}</a></section>`;

/* ---------- Carrello e spedizione ---------- */
const total = () => cart.reduce((n, i) => n + (sizeOf(byId(i.productId), i.size)?.price ?? 0) * i.qty, 0);
const count = () => cart.reduce((n, i) => n + i.qty, 0);
let shipQuote = null;
// Spedizione: dal server (tariffe Printful). In anteprima uso la tariffa standard Printful per l'Italia.
async function quoteShipping(country = 'IT') {
  if (!cart.length) { shipQuote = null; return; }
  if (PREVIEW) { shipQuote = { rate: Math.round((4.49 + 1.25 * (count() - 1)) * 100) / 100, minDays: 3, maxDays: 6 }; return; }
  try {
    const res = await fetch('/api/shipping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country, items: cart }) });
    shipQuote = res.ok ? await res.json() : null;
  } catch { shipQuote = null; }
}
function saveCart(bump = true) {
  cart = cart.filter((i) => byId(i.productId) && i.qty > 0);
  store.set('yfd-cart', cart);
  const el = $('#cart-count');
  el.textContent = count();
  if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
}
function receipt(editable) {
  const t = T();
  if (!cart.length) return `<div class="empty"><p>${t.nothingYet}</p><p class="note">${t.fillsUp}</p><a class="btn hot" href="#/tutte" data-close>${t.seeTees}</a></div>`;
  const lines = cart.map((i, idx) => {
    const p = byId(i.productId); const s = sizeOf(p, i.size);
    return `<div class="line">
      <span class="line-name">${esc(p.name)}</span><span>${eur(s.price * i.qty)}</span>
      <span class="line-meta">${t.sizeColor(esc(i.size), esc(colorOf(p)))}${editable ? '' : ` · ×${i.qty}`}</span>
      ${editable ? `<span class="qty"><button type="button" data-qty="${idx}" data-d="-1" aria-label="${t.removeOne}">−</button><output>${i.qty}</output><button type="button" data-qty="${idx}" data-d="1" aria-label="${t.addOne}">+</button></span>
      <button class="remove" type="button" data-remove="${idx}">${t.remove}</button>` : ''}
    </div>`;
  }).join('');
  const ship = shipQuote ? eur(shipQuote.rate) : t.shipEst;
  return `<div class="receipt">
    <div class="receipt-head">Your Favorite Daddy Shop<br>${t.table(new Date().toLocaleDateString(LOCALE[lang]))}</div>
    ${lines}
    <div class="totals">
      <div><span>${t.tees}</span><span>${count()}</span></div>
      <div><span>${t.shipping}</span><span>${ship}</span></div>
      ${shipQuote?.minDays ? `<div class="ship-note"><span></span><span>${t.shipDays(shipQuote.minDays, shipQuote.maxDays)}</span></div>` : ''}
      <div class="grand"><span>${t.total}</span><span>${eur(total() + (shipQuote?.rate || 0))}</span></div>
    </div>
  </div>
  ${editable ? `<a class="btn hot wide" href="#/checkout" data-close>${t.checkout}</a>` : ''}`;
}
let lastFocus = null;
function openCart() {
  lastFocus = document.activeElement;
  $('#drawer-body').innerHTML = receipt(true);
  $('#drawer').hidden = false;
  document.body.style.overflow = 'hidden';
  $('.drawer-panel .icon-btn').focus();
}
function closeCart() {
  $('#drawer').hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus?.();
}
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------- Maglietta 3D ---------- */
async function mount3d(el, p) {
  tee3d?.destroy(); tee3d = null;
  if (!el || !p?.art) return;
  try {
    // in anteprima il modulo 3D arriva da un altro script (window.__tee3dReady)
    const { mountTee } = window.__tee3dReady ? await window.__tee3dReady : await import('./tee3d.js');
    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#d6124a';
    tee3d = mountTee(el, { accent, onReady: () => el.classList.add('ready') });
    await tee3d?.show(p);
  } catch (e) {
    console.warn('3D non disponibile', e);
  }
}

/* ---------- Lingua e tema ---------- */
function applyLang() {
  const t = T();
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach((el) => { const v = t[el.dataset.i18n]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t[el.dataset.i18nLabel]));
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#ticker').innerHTML = [...t.lines, ...t.lines].map((l) => `<span>${esc(l)}</span>`).join('');
}
// Uomo ha la sua luce (blu); Donna e il resto restano rosa.
function applyTheme(route, arg) {
  let sec = '';
  if (route === 'uomo' || route === 'donna') { sec = route; store.set('yfd-sec', route); }
  else if (route === 'p') { const p = bySlug(arg); const last = store.get('yfd-sec', ''); sec = p?.sections.includes(last) ? last : (p?.sections.length === 1 ? p.sections[0] : ''); }
  else if (route === 'tutte' || !route) store.set('yfd-sec', '');
  document.body.dataset.sec = sec === 'uomo' ? 'uomo' : '';
  $('meta[name="theme-color"]')?.setAttribute('content', sec === 'uomo' ? '#dbe4f6' : '#f9e0e3');
}

/* ---------- Router ---------- */
function parseHash() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const [route, arg] = path.split('/');
  return { route, arg: decodeURIComponent(arg || ''), params: new URLSearchParams(query) };
}
function render() {
  const { route, arg, params } = parseHash();
  tee3d?.destroy(); tee3d = null;
  applyTheme(route, arg);
  let html;
  if (!route) html = home();
  else if (T().sec[route]) html = section(route);
  else if (route === 'p') html = product(arg);
  else if (route === 'checkout') html = checkout();
  else if (route === 'grazie') html = thanks(arg, params.get('session_id'));
  else html = notFound();
  $('#main').innerHTML = html;
  const current = route === 'p' ? (document.body.dataset.sec || bySlug(arg)?.sections[0]) : route;
  $$('[data-nav]').forEach((a) => (a.dataset.nav === current ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  bindPage(route, arg, params);
}

function bindPage(route, arg, params) {
  const t = T();
  if (!route) {
    let n = 0;
    $('#napkin-next')?.addEventListener('click', () => {
      n = (n + 1) % t.lines.length;
      $('#napkin-line').textContent = t.lines[n];
      $('#napkin-n').textContent = t.lineN(n + 1, t.lines.length);
    });
    const stage = $('#stage');
    const first = bySlug($('[data-pick]')?.dataset.pick);
    if (stage && first) mount3d(stage, first);
    $$('[data-pick]').forEach((b) => b.addEventListener('click', () => {
      const p = bySlug(b.dataset.pick);
      $$('[data-pick]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $('#stage-name').textContent = p.name;
      $('#stage-link').href = `#/p/${p.slug}`;
      $('#stage-link').textContent = `${eur(p.price)} · ${t.buyIt} →`;
      $('.stage-fallback').src = p.image;
      if (tee3d) tee3d.show(p); else mount3d(stage, p);
    }));
    // Inclinazione 3D delle foto di coppia
    $$('.couple').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
        c.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 10}deg`);
      });
      c.addEventListener('pointerleave', () => { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); });
    });
  }
  if (route === 'p') {
    const p = bySlug(arg);
    const main = $('#gallery-main');
    const press = (b) => $$('.thumbs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $$('[data-shot]').forEach((b) => b.addEventListener('click', () => {
      tee3d?.destroy(); tee3d = null;
      main.querySelector('.stage')?.remove();
      main.querySelector('img').src = b.dataset.shot;
      press(b);
    }));
    $('[data-3d]')?.addEventListener('click', (e) => {
      press(e.currentTarget);
      if (main.querySelector('.stage')) return;
      const stage = document.createElement('div');
      stage.className = 'stage';
      stage.innerHTML = `<span class="stage-hint">↔ ${t.drag}</span>`;
      main.appendChild(stage);
      mount3d(stage, p);
    });
    const form = $('#add-form');
    if (!p || !form) return;
    const price = () => { $('#pdp-price').textContent = eur(sizeOf(p, form.size.value)?.price ?? p.price); };
    form.addEventListener('change', price);
    price();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const size = form.size.value;
      if (!size) return toast(t.chooseSize);
      const line = cart.find((i) => i.productId === p.id && i.size === size);
      if (line) line.qty++; else cart.push({ productId: p.id, size, qty: 1 });
      saveCart();
      toast(t.added(size));
      await quoteShipping(store.get('yfd-customer', {}).country || 'IT');
      openCart();
    });
  }
  if (route === 'checkout') {
    const form = $('#checkout-form');
    if (!form) return;
    const pay = PREVIEW || config.payments;
    const refresh = async () => {
      await quoteShipping(form.country.value);
      $('#checkout-receipt').innerHTML = receipt(false);
      $('#pay-btn').textContent = (pay ? t.pay : t.send)(eur(total() + (shipQuote?.rate || 0)));
    };
    form.country.addEventListener('change', refresh);
    refresh();
    form.addEventListener('submit', async (e) => {
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
      const btn = $('#pay-btn');
      btn.disabled = true; btn.textContent = t.sending;
      try {
        if (PREVIEW) {
          cart = []; saveCart(false);
          location.hash = `#/grazie/${t.previewId}-${Date.now().toString(36).toUpperCase()}`;
          return;
        }
        const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: data, items: cart, lang }) });
        const out = await res.json();
        if (!res.ok) throw new Error((out.errors || [out.error]).join('. '));
        if (out.payUrl) { store.set('yfd-pending', out.id); location.href = out.payUrl; return; }
        cart = []; saveCart(false);
        location.hash = `#/grazie/${encodeURIComponent(out.id)}`;
      } catch (err) {
        $('#errors').textContent = t.sendFail(err.message);
        btn.disabled = false; btn.textContent = (pay ? t.pay : t.send)(eur(total() + (shipQuote?.rate || 0)));
      }
    });
  }
  if (route === 'grazie' && params.get('session_id') && !PREVIEW) {
    // Ritorno da Stripe: svuoto il carrello e controllo il pagamento.
    cart = []; saveCart(false);
    (async () => {
      for (let i = 0; i < 6; i++) {
        const out = await fetch(`/api/orders/${encodeURIComponent(arg)}/status`).then((r) => r.json()).catch(() => ({}));
        if (out.status === 'pagato' || out.status === 'in produzione') {
          $('#thanks-label').textContent = t.paidLabel;
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      $('#thanks-label').textContent = t.received;
    })();
  }
}

/* ---------- Avvio ---------- */
async function start() {
  applyLang();
  try {
    catalog = window.__CATALOG__ || await (await fetch('/api/catalog')).json();
    if (!PREVIEW) config = await fetch('/api/config').then((r) => r.json()).catch(() => config);
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
  $('#drawer').addEventListener('click', async (e) => {
    const q = e.target.closest('[data-qty]'); const r = e.target.closest('[data-remove]');
    if (q) { const i = cart[+q.dataset.qty]; i.qty = Math.max(1, Math.min(20, i.qty + +q.dataset.d)); }
    else if (r) cart.splice(+r.dataset.remove, 1);
    else { if (e.target.closest('[data-close]')) closeCart(); return; }
    saveCart();
    await quoteShipping(store.get('yfd-customer', {}).country || 'IT');
    $('#drawer-body').innerHTML = receipt(true);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#drawer').hidden) closeCart(); });
  window.addEventListener('hashchange', () => {
    render();
    window.scrollTo(0, 0);
    if (parseHash().route) $('#main').focus({ preventScroll: true });
  });
  render();
}
start();
