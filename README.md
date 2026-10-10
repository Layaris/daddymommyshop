# Your Favorite Daddy Shop: il sito

Negozio custom collegato al negozio Printful "Your Favorite Daddy Shop" (store 15135959). Node 20+, nessuna dipendenza.

## Avvio
    npm run sync      # legge prodotti e modelli da Printful -> data/catalog.json (+ mockup in public/img)
    npm start         # http://localhost:3000, pannello ordini e clienti su /admin
    npm run preview   # crea dist/anteprima.html (un solo file, checkout simulato)

Variabili: PRINTFUL_API_TOKEN (in produzione), PRINTFUL_STORE_ID, PORT, ADMIN_PASSWORD (default "daddy": cambiala),
PRINTFUL_DRAFTS=1 per creare in automatico un ordine BOZZA su Printful a ogni ordine (non parte la stampa finché non lo confermi).
Nel cloud di Claude serve NODE_USE_ENV_PROXY=1 per uscire dal proxy.

## Dove si cambia cosa
- data/catalog-overrides.json: nome, frase, sezioni (uomo/donna), prezzo, sfacciataggine 1-5, nascondi. Poi `npm run sync`.
- public/styles.css (grafica), public/app.js (pagine), server.js (API ordini/admin), lib/printful.js (Printful).

## Stato
- Pagamenti: non ancora (l'ordine arriva in /admin, il pagamento si chiede a parte). Prossimo passo: Stripe.
- Il prodotto "Who's Your Daddy Tonight?" usa una base Printful (Men's Premium Pima, 563) uscita dal catalogo: va rifatto su una base attiva.
