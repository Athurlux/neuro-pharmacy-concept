# Verification (19 October 2026)

These checks were actually run. Physical devices, screen readers, Safari/Firefox and Lighthouse were **not** tested.

## Automated

- `tsc -b`: no errors (strict, no unused locals or parameters).
- `npm run build`: passes. The main chunk is about 111 KB gzipped. GSAP (about 46 KB gzipped) loads only with pages that animate or sell items. Each route is its own chunk.
- `npm test`: 13 Vitest tests pass. They cover basket merging, the quantity cap and removal; integer subtotals, fees and totals; storage round-trip and recovery from corrupt, old-version, unknown-ID, duplicate and odd-quantity data; filter parsing, URL writing, search and sorting; phone validation for Uganda and international numbers; contact-method rules; skipping the checkout address step for collection; protection against skipping steps by URL; dropping address answers after switching to collection; and accepting only the fictional prescription sample.
- `npm run verify`: **61/61 checks pass**, both against the local preview and against https://neuro-pharmacy-concept.pages.dev. One headless Chrome ran them in sequence:
  - The homepage quick enquiry carries the item and branch in memory (the item never enters the URL), and the availability enquiry completes with no stock result.
  - Shop: search lives in the URL, a conflicting filter shows the empty state, Back undoes a filter, chip removal works, price sort works, Reset clears everything.
  - Product quantity and add; merging repeat adds; the pouch is described as empty; the header count and live announcement update.
  - Basket panel: focus moves inside, the subtotal agrees with the lines, Escape closes it and focus returns.
  - Basket page: refresh persistence; quantity changes; storage holds exactly `{"version":1,"items":[{id,qty}…]}`; removal; clear and undo.
  - Checkout: error summary and focus on an empty step; collection fee UGX 0 and delivery fee UGX 5,000; preferred branch carried from the directory; invalid phone rejected; address step only for delivery; review totals; editing back to collection drops the address and fee; a double-clicked completion produces one confirmation; the confirmation text is exact; no dispatch or approval wording; basket emptied; Back cannot complete twice; refresh shows an honest fallback.
  - Prescription page has no file input; the sample previews; the simulation completes. A branch page carries its branch into a pharmacist request, which completes. Contact completes, and listed contacts are unlinked and kept apart from the form.
  - Corrupt storage recovers. Direct loads of nested, unknown and step URLs work.
  - Mobile menu focus and Escape; reduced motion leaves the hero settled with no step sequence.
  - The ScrollTrigger count stays at 12 → 12 after three navigation round trips and five resizes.
  - No horizontal overflow on 9 routes at 360, 390, 768, 1024 and 1440px.
  - No non-GET requests, no third-party requests, no entered details in request URLs. Storage holds only the basket key, plus React Router's scroll positions in sessionStorage. No failed requests and no console errors.
- Live HTTP: `/`, `/delivery`, `/shop/thermometer`, `/branches/kyanja`, `/checkout/confirmation`, a hero master and the delivery social image all return 200. `/delivery` serves the delivery `og:image`. `X-Robots-Tag: noindex, nofollow` is present.

## Visual review

Screenshots in `docs/screenshots/` were inspected at 1440, 1024, 390 and 360px. Fixes made before publishing:

- The desktop hero headline wrapped onto five lines and crowded the counter plant. The type scale and copy column were reduced, and the hero was shortened so the enquiry ledge shows on a laptop screen.
- The delivery note icon was misaligned.
- "Add to basket" wrapped onto two lines on small-phone cards.
- The "to confirm" list used ticks, which read as already done; it now uses open boxes.

Contrast was computed for the token pairs. Ink on warm white is 13.5:1, muted 5.4:1, teal 7.6:1, warm white on deep teal 10.9:1, and the lead badge 7.4:1.

## Known limitations

- Form drafts, confirmations and the preferred branch are memory-only by design, so they reset on a full page reload.
- Branch information is unconfirmed (see CONTENT-NOTES.md). The Facebook source could not be rechecked without a login.
- Keyboard checks were automated for the dialog and menu only. A full manual keyboard and screen-reader audit was not done.
