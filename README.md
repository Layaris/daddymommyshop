# Your Favorite Daddy Shop: il sito

Negozio custom collegato al negozio Printful "Your Favorite Daddy Shop" (store 15135959), con pagamento Stripe.
Node 20+, nessuna dipendenza (three.js è in public/vendor).

## Avvio
    npm start         # http://localhost:3000, ordini e clienti su /admin
    npm run sync      # prezzi e taglie da Printful -> data/catalog.json
    npm run preview   # dist/anteprima.html (un solo file, pagamento simulato)

## Aggiungere una maglietta
1. Metti il PNG (4500x5400, fondo trasparente) in design/ e fai push su GitHub (Printful lo scarica da lì).
2. Aggiungi la voce in data/designs.json (nome = la frase in inglese, colore, sezioni, sfacciataggine, testi it/en).
3. `node scripts/printful-setup.mjs <slug>`: crea il prodotto su Printful (Bella+Canvas 3001, tutte le taglie).
4. `node scripts/printful-mockups.mjs <slug>`: scarica le foto reali (piatta, coppia, uomo, donna).
5. `python3 scripts/images.py` e `npm run sync`.

## Pagamento e ordini
- Cliente compila la cassa -> il server calcola la spedizione con le tariffe Printful -> apre Stripe Checkout.
- Pagamento riuscito (webhook Stripe o ritorno sulla pagina di grazie) -> ordine "pagato" -> ordine creato su Printful.
- Senza STRIPE_SECRET_KEY il sito funziona lo stesso: l'ordine arriva in /admin e il pagamento si chiede a parte.

Variabili:
- STRIPE_SECRET_KEY (sk_live_... o sk_test_...), STRIPE_WEBHOOK_SECRET (whsec_..., webhook su /api/stripe/webhook, evento checkout.session.completed)
- PUBLIC_URL (es. https://tuodominio.it, per i link di ritorno da Stripe)
- PRINTFUL_API_TOKEN, PRINTFUL_STORE_ID
- PRINTFUL_CONFIRM=1: dopo il pagamento l'ordine Printful parte subito in stampa. Senza, resta in bozza e lo confermi tu dalla dashboard.
- PRINTFUL_DRAFTS=1: senza Stripe, crea comunque una bozza Printful per ogni ordine.
- ADMIN_PASSWORD (default "daddy": cambiala), PORT
Nel cloud di Claude serve NODE_USE_ENV_PROXY=1.

## Dove si cambia cosa
public/styles.css (grafica: rosa per tutti, blu nella sezione Uomo), public/app.js (pagine e testi IT/EN),
public/tee3d.js (maglietta 3D), server.js (API), lib/printful.js, lib/stripe.js.
