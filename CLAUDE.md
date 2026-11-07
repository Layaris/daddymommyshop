# Your Favorite Daddy Shop: istruzioni per Claude

Negozio custom di magliette "da rimorchio" (frasi divertenti tipo "Call me daddy"), collegato al negozio Printful
"Your Favorite Daddy Shop" (store id 15135959). Proprietario: Daniele (GitHub `Layaris`).

**All'inizio di ogni sessione leggi `docs/claude/STATO.md` e gli altri file in `docs/claude/`.
Alla fine aggiorna `STATO.md` nella tua PR.**

## A) Regole fisse

- Rispondi sempre in **italiano**, semplice e senza gergo. Il sito è in italiano e inglese (selettore IT/EN).
  Le frasi stampate sulle magliette sono **solo in inglese**.
- **Niente merge, niente push su `main` e niente cancellazione di rami senza l'ok esplicito di Daniele**
  (regola del 6 nov 2026, prevale sull'autonomia). Lavora su un ramo, apri la PR, fai girare la CI e chiedi prima di unire.
  Le PR di Dependabot si uniscono solo con il suo ok.
- Chiedi prima anche per ciò che non si può annullare: ordini veri su Printful, pagamenti live, cancellazione di prodotti.
- Per il resto procedi in autonomia, senza chiedere approvazione a ogni passo.
- Modello: Opus con effort **medium** di default, **high** solo quando serve davvero, mai oltre high.
- Il **copy della prima versione** del sito è vincolante: non riscriverlo. Le revisioni riguardano la grafica.
  Non stravolgere l'impianto: sito bello, intuitivo e che vende.
- **Segreti**: mai in chat, nei file o nei commit. Solo come segreti dell'environment o variabili d'ambiente.
  Qui si scrivono solo i nomi:
  - `PRINTFUL_API_TOKEN`, `PRINTFUL_STORE_ID`
  - `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_ENV` (`sandbox` per le prove)
  - `PUBLIC_URL`
  - `ADMIN_PASSWORD` (non lasciare il valore di default)
  - facoltativi: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PRINTFUL_CONFIRM`, `PRINTFUL_DRAFTS`
  - nel cloud di Claude serve `NODE_USE_ENV_PROXY=1`
- **Pubblicazione**: il sito **non è ancora online**. Le anteprime si fanno con `npm run preview`
  (`dist/anteprima.html`, pagamento simulato). Messa online solo con l'ok di Daniele.
- **Cose da non fare**:
  - non cambiare la grafica v1 senza richiesta;
  - niente redesign "chat DM", streetwear nero/bianco/rosa, palette diverse dalla v1, generatore di frasi;
  - non usare `pkill -f "node server.js"` dentro un comando composto (uccide la shell).

## B) Parte tecnica (verificata sul codice il 7 nov 2026)

- **Stack**: Node 20+ (`engines` in `package.json`), zero dipendenze npm, three.js in `public/vendor/`.
  Server in `server.js`, librerie in `lib/` (`printful.js`, `paypal.js`, `stripe.js`), sito in `public/`.
- **Comandi**:
  - `npm start`: negozio su http://localhost:3000 (oppure `PORT`), ordini e clienti su `/admin`
  - `npm run sync`: prezzi e taglie da Printful in `data/catalog.json`
  - `npm run preview`: `dist/anteprima.html`, un solo file con pagamento simulato
- **Prodotti**: la fonte è `data/designs.json` (elenco `designs` e tabella `modelli`).
  Modelli: `essenziale` (Gildan 5000, 24,90 €), `unisex` (Bella+Canvas 3001, 29,90 €),
  `premium` (Comfort Colors 1717, 36,90 €), `donna` (Bella+Canvas 6400, 31,90 €). Retro: +6 € (`prezzoRetro`).
- **Aggiungere una maglietta**:
  1. PNG 4500x5400 con fondo trasparente in `design/` (oggi stanno in `design/frasi/` e `design/daniele/`;
     il percorso va nel campo `fronte` del design).
     Printful scarica il file da GitHub, ramo `main` (oppure da `DESIGN_BASE_URL`): quindi serve che il file sia su `main`,
     cioè una PR unita con l'ok di Daniele.
  2. Voce in `data/designs.json`.
  3. `node scripts/printful-setup.mjs <slug>` (crea un prodotto Printful per ogni modello).
  4. `node scripts/printful-mockups.mjs <slug>` (foto reali e maglietta piatta per il 3D).
  5. `python3 scripts/images.py`, poi `npm run sync`.
- **Taglie per paese**: `public/regions.js` (usato sia dal sito sia dal server) barra le taglie che Printful
  non produce nella zona del cliente.
- **Pagamenti**: PayPal è il principale (`lib/paypal.js`, ritorno su `/api/paypal/return` che incassa e segna l'ordine pagato).
  Stripe è nel codice (`lib/stripe.js`, webhook `/api/stripe/webhook`) ma spento finché mancano le chiavi.
  `PAYPAL_API_URL` permette di provare contro un server finto.
- **Ordini**: ordine pagato -> bozza su Printful. Con `PRINTFUL_CONFIRM=1` parte subito in stampa;
  con `PRINTFUL_DRAFTS=1` crea la bozza anche senza pagamento online.
- **CI**: `.github/workflows/ci.yml` (ubuntu-24.04, Node 24, action fissate a SHA): sintassi JS, JSON validi,
  avvio del server e prova di home, admin, catalogo e admin senza password (deve dare 401/403).
  **Dependabot**: `.github/dependabot.yml`, aggiorna le action ogni settimana.
- **Strumenti di design**: skill in `.claude/skills/` (impeccable, emil-design-eng, taste). Dettagli in `docs/claude/strumenti.md`.
