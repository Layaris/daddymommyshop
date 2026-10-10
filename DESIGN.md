# Design

Direction: classic streetwear store, done with care. Rejected: blush pink + wine (v1 look) and the "chat DM" world.

## Tokens
- Background #ffffff, surface #f1f0ec (matches the mockup backdrop), line #dddad3.
- Ink #0d0d0d, secondary ink #55534e.
- Pink #ff2e7e for decoration (ticker, spice pips, logo script). Pink #e0146a for anything carrying white text or pink text on white (AA 4.7:1).
- Paper #fffaf0 for the napkin and the receipt.

## Type
- Anton, uppercase: headings, prices on the product page, section names.
- Archivo: body and UI.
- Mr Dafoe: logo script, napkin line, product tagline.
- DM Mono: receipt and counters.

## Components
- Announcement bar (black), sticky header (logo, Uomo/Donna/Tutte pills, IT/EN switch, black cart pill with pink count).
- Ticker of lines on pink. Kept on purpose from v1: decorative, aria-hidden, pauses on hover, off with reduced motion.
- Hero: huge line "La frase giusta, addosso.", two CTAs, three perks; product shot with price chip and the napkin card that rotates lines.
- Uomo/Donna tiles with a real mockup and gradient.
- Product card: mockup, artwork on hover, name, tagline, price, spice pips.
- Product page: gallery with thumbs (tee and artwork), size chips, full-width pink "Aggiungi al conto" which opens the cart.
- Cart drawer "Il tuo conto" as a receipt (Tavolo 69).

## Checked
- impeccable detect: only the ticker marquee flagged (accepted, see above).
- Screenshots at 1440 and 390 wide, no horizontal overflow.
