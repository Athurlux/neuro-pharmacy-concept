# Visual implementation handoff

## Page-to-asset map
- Home desktop/mobile: home-hero-desktop / home-hero-mobile.
- Delivery desktop/mobile: delivery-hero-desktop / delivery-hero-mobile. Rider, parked motorbike and marked box establish delivery before text is read.
- Pharmacy contact/service explanation: pharmacist-conversation.
- Collection checkout option: collection-counter.
- Delivery explanation or confirmation supporting image: delivery-handover. Do not imply dispatch actually occurred.
- Personal-care category: category-personal-care.
- Eight product assets: individual catalogue cards, detail pages, basket lines and review summaries. Do not crop objects from the group still life as extra products.
- Logo variants: branding/*.svg; concept monogram is optional. Keep the full wordmark for clarity.
- Empty basket/results and demo completion: states/*.svg.
- Prescription process: use only samples/prescription-process-demo.svg through a “Use demo document” action. It is intentionally not a real prescription.

## Layout and motion
Home heroes have clean copy space. Delivery heroes have prominent imagery and signage; keep headings in a separate panel or above the photo if overlay becomes crowded. Portrait delivery art fills most of the frame; do not obscure the box with text. No forced edge-to-edge cropping that removes the motorbike or faces.

Use short GSAP entrances, restrained reveals and accessible add-to-basket feedback. Prefer transforms/opacity, context cleanup and responsive matchMedia. Native scrolling, readable content and visible CTAs take priority. Reduced-motion mode remains complete and static. These are flat images, not 3D models or animation sequences. Do not fake spinning wheels, flying medicine packs or moving facial features.

## Complete demo journeys
Shop/filter/search → item → basket → delivery/collection → sample details → review/edit → explicit demo confirmation. Share basket state between panel and cart page. Persist only IDs and quantities; merge duplicates, recover bad storage, clear correctly. No personal data or medical enquiry content in localStorage. Branch and item availability enquiries are separate from medicine purchase approval.

Use the eight-item demo catalogue and clearly labelled demo fee rather than inventing real offers. Collection fee zero is also demo behaviour, not an operational promise. No card collection, payment authorisation or actual order submission. Confirmation: “Demo complete. No order was placed, no payment was taken and no items were reserved.” Do not imply a rider has been dispatched.

Use branch selection, contact/availability forms and a pharmacist-contact enquiry with validation, review, edit and honest demo completion. Use sample information to demonstrate each. Do not solicit real prescriptions or patient records on the public concept.

Lazy-load supporting scenes, preload only the active hero, declare image dimensions and use the smaller web variants for cards. Keep the demo label discreet but clear, with local notices beside form actions. All new website pages should work on direct URL refresh on the eventual separate Cloudflare deployment.
