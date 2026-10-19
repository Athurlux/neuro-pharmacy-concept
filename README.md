# Neuro Pharmacy: independent website concept

A working website proposal for Neuro Pharmacy, a neighbourhood pharmacy in Kampala. Visitors can find a branch, ask whether an item is available, contact a pharmacist, walk through a prescription process using a fictional sample, and try a demo shop with delivery or collection and a full checkout.

**This is not Neuro Pharmacy's official website, and Neuro Pharmacy has not commissioned or approved it.** The branding is a concept proposal. Products, prices and fees are fictional. Branch details are unconfirmed. Forms send nothing. No order, payment, reservation or prescription is processed.

Concept design & development by Arthur Kitandwe ([portfolio](https://arthur-kitandwe.kranks533.workers.dev/)).

- Live: https://neuro-pharmacy-concept.pages.dev (noindex; it is still public)
- Pitch talking points: [PITCH-NOTES.md](PITCH-NOTES.md)
- Assets: [docs/ASSETS.md](docs/ASSETS.md) · Content and sources: [docs/CONTENT-NOTES.md](docs/CONTENT-NOTES.md) · Checks: [docs/VERIFICATION.md](docs/VERIFICATION.md)

## Pages and journeys

| Route | What it does |
|---|---|
| `/` | Hero with three main actions, a quick branch-and-item enquiry, categories, featured items, the delivery/collection journey, branches, pharmacist contact |
| `/shop`, `/shop/:slug` | Search, category filters, sort, removable chips, reset, result count and empty state, all in the URL. Product detail has quantity, add to basket and related items |
| `/basket` | Shared basket: merge, quantities, remove, clear with undo, totals |
| `/delivery` | The delivery story: rider hero, how the demo works, delivery vs collection, handover scene, FAQs |
| `/checkout` → `/checkout/confirmation` | Delivery or collection → branch and contact → delivery details (delivery only) → review/edit → demo confirmation |
| `/branches`, `/branches/:slug` | Branch references and leads with sources, unconfirmed contacts as text, and a preferred-branch choice |
| `/enquire/availability` | Item availability enquiry (separate from the basket; no stock result) |
| `/enquire/pharmacist` | Pharmacist-contact request |
| `/prescriptions` | Prescription walk-through using only the fictional sample |
| `/about`, `/contact`, `*` | Concept disclosure, general contact, not-found page |

## Stack

React 19, TypeScript, Vite 7, React Router 7 (lazy route chunks), GSAP + ScrollTrigger via `@gsap/react`, plain CSS with tokens, self-hosted Manrope (variable). There are no other runtime dependencies, no analytics and no third-party requests.

- `src/data/`: catalogue (from the pack's `demo-catalogue.json`), demo fees (`demo-commerce.json`), and branch data with sources and status
- `src/lib/basket.ts`: the basket store. It persists only `{ id, qty }` in `localStorage` (`neuro-concept-basket`), recovers from bad data, and uses integer shilling arithmetic
- `src/forms/`: the declarative form engine (steps, conditional steps, validation, review/edit, one-time completion) and the five journey specs in `flows.ts`
- `src/animation/useSiteMotion.ts`: all scroll and entrance motion, scoped with `useGSAP` + `matchMedia`, with a reduced-motion path

Form drafts, completions and the preferred branch live only in React memory and are cleared on refresh.

## Commands

```bash
npm install
npm run dev          # http://127.0.0.1:5173
npm test             # unit tests (basket, storage recovery, fees, filters, validation, steps)
npm run build        # type-check + production build to dist/
npm run preview -- --port 4178
npm run verify       # browser journeys against the preview (needs Chrome installed)
npm run images       # regenerate public/images from assets-src/pack (Python + Pillow)
```

On Git Bash for Windows, prefix script runs that take URL paths with `MSYS_NO_PATHCONV=1`.

## Deployment (Cloudflare Pages, Direct Upload)

The site is uploaded straight from `dist/`. **A push to GitHub does not publish anything.** To release:

```bash
npm test
npm run deploy                                    # build + wrangler pages deploy (project: neuro-pharmacy-concept)
VERIFY_URL=https://neuro-pharmacy-concept.pages.dev npm run verify
```

`public/_redirects` sends every route to the SPA, so nested URLs survive a refresh. The build also writes `dist/delivery.html` with the delivery social preview, which Pages serves at `/delivery`. `public/_headers` adds `X-Robots-Tag: noindex` and long caching for hashed assets.
