# Your Favorite Daddy Shop: il sito

Negozio custom collegato al negozio Printful "Your Favorite Daddy Shop" (store 15135959), con pagamento PayPal (e carta via Stripe, se un giorno serve).
Node 20+, nessuna dipendenza (three.js è in public/vendor).

## Avvio
    npm start         # http://localhost:3000, ordini e clienti su /admin
    npm run sync      # prezzi e taglie da Printful -> data/catalog.json
    npm run preview   # dist/anteprima.html (un solo file, pagamento simulato)

## Aggiungere una maglietta
1. Metti il PNG (4500x5400, fondo trasparente) in design/ e fai push su GitHub (Printful lo scarica da lì).
2. Aggiungi la voce in data/designs.json (nome = la frase in inglese, colore, sezioni, sfacciataggine, testi it/en).
   In `modelli` elenca le versioni: `unisex` (Bella+Canvas 3001) e/o `donna` (Bella+Canvas 6400, vestibilità morbida).
3. `node scripts/printful-setup.mjs <slug>`: crea su Printful un prodotto per ogni modello (tutte le taglie).
4. `node scripts/printful-mockups.mjs <slug>`: scarica le foto reali (piatta, coppia, uomo, donna, indossata) e la maglietta trasparente per il 3D.
5. `python3 scripts/images.py` e `npm run sync`.

## Modelli e paesi
Ogni design può avere più modelli; sul sito il cliente sceglie la vestibilità e la taglia.
Printful non produce tutte le taglie ovunque (es. 5XL unisex e 3XL donna solo in USA): `npm run sync` salva per ogni taglia
le zone di produzione e il sito barra le taglie che non si producono per il paese scelto (public/regions.js, controllato anche dal server).

## Pagamento e ordini
- Cliente compila la cassa -> il server calcola la spedizione con le tariffe Printful -> apre PayPal (o Stripe Checkout, se attivo e scelto).
- PayPal: al ritorno il server incassa (/api/paypal/return) -> ordine "pagato" -> ordine creato su Printful.
- Stripe: webhook o ritorno sulla pagina di grazie -> ordine "pagato" -> ordine creato su Printful.
- Senza nessun pagamento attivo il sito funziona lo stesso: l'ordine arriva in /admin e il pagamento si chiede a parte.

Variabili:
- PAYPAL_CLIENT_ID, PAYPAL_SECRET (conto PayPal Business > developer.paypal.com > Apps & Credentials, app "Live"); PAYPAL_ENV=sandbox per le prove
- STRIPE_SECRET_KEY (sk_live_... o sk_test_...), STRIPE_WEBHOOK_SECRET (whsec_..., webhook su /api/stripe/webhook, evento checkout.session.completed)
- PUBLIC_URL (es. https://tuodominio.it, per i link di ritorno da PayPal e Stripe)
- PRINTFUL_API_TOKEN, PRINTFUL_STORE_ID
- PRINTFUL_CONFIRM=1: dopo il pagamento l'ordine Printful parte subito in stampa. Senza, resta in bozza e lo confermi tu dalla dashboard.
- PRINTFUL_DRAFTS=1: senza pagamento online, crea comunque una bozza Printful per ogni ordine.
- ADMIN_PASSWORD (default "daddy": cambiala), PORT
Nel cloud di Claude serve NODE_USE_ENV_PROXY=1.

## Dove si cambia cosa
public/styles.css (grafica: rosa per tutti, blu nella sezione Uomo), public/app.js (pagine e testi IT/EN),
public/tee3d.js (maglietta 3D), server.js (API), lib/printful.js, lib/paypal.js, lib/stripe.js.
