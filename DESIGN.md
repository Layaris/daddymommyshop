# Design

Base: the first version (the bar at the end of the night). Daniele rejected the chat look and the black/white streetwear look; v1 is the one he likes.

## Tokens
- Default (home, Donna, Tutte): bg #f9e0e3 blush, surface #fff3f4, ink #2b0a17 wine, accent #d6124a lipstick, gold #e7a400.
- Uomo (body[data-sec="uomo"]): bg #dbe4f6, surface #f1f5ff, ink #0b1838 night blue, accent #2346e8 electric blue, gold #ffb800. Colors transition in .5s.
- Fonts: Shrikhand (display), Bricolage Grotesque (body), DM Mono (labels, prices, receipt).

## Components
- Header, phrase ticker (kept from v1, pauses on hover), hero with v1 copy.
- 3D tee (public/tee3d.js, three.js 0.160): puffed tee silhouette with the real artwork, drag to spin, design picker, napkin card.
- Uomo/Donna tiles with real Printful lifestyle photos.
- "Coppie che ci provano": real Printful couple photos with speech bubbles, 3D tilt on hover.
- Product cards: flat Printful mockup, couple photo on hover. Product page: gallery + 3D view.
- Cart "Il tuo conto" (receipt, Tavolo 69) with Printful shipping; checkout to Stripe.
