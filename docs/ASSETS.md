# Assets

All visual assets come from `Neuro_Pharmacy_Complete_Assets.zip` (19 October 2026). The archive was extracted to `assets-src/pack/` unchanged: 67 files, and all 32 bitmaps opened and decoded. `scripts/prepare-images.py` copies or derives everything in `public/`.

## Provenance and status

- **Photographs (16 masters + 16 web versions):** AI-generated concept artwork (prompts in `assets-src/pack/guides/GENERATION_PROMPTS.json`). People, interiors, storefronts, riders and packaging are fictional. They are not staff, premises or proof of a delivery service, and every use carries alt text or a caption that says so.
- **Wordmark, monogram and favicons:** proposed concept branding, not the official identity. The site uses the full wordmark everywhere. Brain and leaf symbols that appear in the generated scenery are incidental. They are not branding and say nothing about neurological services.
- **Icons (12):** the pack's stroked SVG paths, inlined in `src/components/Icon.tsx`. A few interface glyphs (minus, close, edit, print, trash, info) were drawn on the same grid.
- **States:** `empty-basket.svg`, `no-results.svg` and `demo-complete.svg` are used as supplied.
- **Prescription sample:** `samples/prescription-process-demo.svg` is the only document in the prescription walk-through. It is marked "not a prescription" and contains no patient, clinician, medicine, dose or signature.
- **Social previews:** `social-home-1200x630.jpg` on every page and `social-delivery-1200x630.jpg` on `/delivery`.

## How images are served

| Use | File(s) | Notes |
|---|---|---|
| Home hero, desktop/tablet | `home-hero-desktop-768/1536.webp` | Full-bleed `<picture>`; copy sits in the photo's quiet left wall |
| Home hero, phone | `home-hero-mobile-480/800/1024.webp` | **Derived:** a 2:1 band cropped from the portrait master (y 380–892) around the pharmacist, so actions and the quick enquiry stay near the top |
| Delivery hero, ≥900px | `delivery-hero-desktop-768/1536.webp` | Split layout; text sits in its own panel, not over the image |
| Delivery hero, phone | `delivery-hero-mobile-480/800/1024.webp` | **Derived:** a square from the portrait master (y 130–1154) keeping the sign, helmet, marked box and motorbike |
| Scenes | `<name>-768.webp` + full master | `srcset`, lazy, dimensions declared |
| Products | `product-*-768.webp` + `-1254.webp` | Square, cover-fit; opaque off-white backgrounds kept as supplied |

Only the active hero is preloaded: an inline script in `index.html` adds a media-scoped preload for `/` or `/delivery` alone. Supporting scenes lazy-load. Masters are never on the first screen at phone widths.

Font: Manrope variable (`@fontsource-variable/manrope`, SIL Open Font License), self-hosted. Browsers download only the subsets a page needs.
