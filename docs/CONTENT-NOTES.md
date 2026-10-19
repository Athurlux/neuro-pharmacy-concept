# Content notes

## Concept status

Independent, unsolicited proposal. A discreet "Independent website concept" tag sits in the header. The footer and About page say the site is not official, not an ordering service, and not commissioned or approved by Neuro Pharmacy. Each form, the checkout and each confirmation carries its own demo notice. Credit: "Concept design & development by Arthur Kitandwe", linked to the portfolio.

## Products and prices

These are the eight items from `demo-catalogue.json`, with the same IDs, names, categories and UGX prices. Descriptions only say what the photograph shows. No ingredients, sizes, makers, certifications, stock levels, clinical benefits, device accuracy or suitability claims are made. The first aid pouch is described as **empty**. No prescription medicines are listed. Medicine questions go through the separate availability enquiry, which never shows a stock result, recommends anything or turns into an order.

Demo fees come from `demo-commerce.json`: delivery UGX 5,000, collection UGX 0. Both are labelled as demo fees wherever they appear. Coverage, dispatch, arrival times, same-day delivery, cold chain, emergency delivery and rider tracking are never claimed. The checkout confirmation reads: "Demo complete. No order was placed, no payment was taken and no items were reserved."

## Branch and contact register (rechecked 19 October 2026)

| Source | Result of recheck |
|---|---|
| Medpages (orgcode 405789) | Neuro Pharmacy, Komamboga Road (filed under Nakawa). No phone, hours or services. Last updated 22 Feb 2023, with the note "We are currently updating the information… We cannot, at this point, verify that it is all correct." |
| Uganda Health Directory, Kyanja listing | "Neuro Pharmacy – Kyanja", Komaboga Road, Kyanja; +256 700 598331; general pharmacy. No hours and no date beyond a 2026 footer. |
| Uganda Health Directory 2025–26 flipbook, p. 224 | Neuro Pharmacy Limited: (1) Kanyanya–Bahai Road, Kampala Quality Primary School junction, 0779 091829; (2) Ntinda Road, TMT Supermarket, Bukoto, 0708 389041. Both list neuropharmaltd@gmail.com. |
| Facebook page | Not rechecked: it needs a login. The register's notes (Kyanja–Kisasi Road near Kensington Estates/Prime Fuel; Kira/Bulindo; Naguru) are recorded as leads. |

How the site uses this (`src/data/branches.ts`):

- **Listed location references:** Kyanja, Kanyanya and Bukoto. A public directory lists each one. Each is labelled as not confirmed with the business and possibly out of date.
- **Provisional leads:** Naguru, Kira–Bulindo and Kawempe (Waliggo Road). These come from social text or the brief only.
- The brief's "Kikaya/Bahai, opposite Kampala Quality" lead appears to be the same place as the directory's Kanyanya–Bahai Road entry, so it is folded in and noted.
- **Conflicting numbers** (Kyanja: +256 700 598331 from the directory vs +256 702 649920 from the brief) are both shown as plain text with their sources and are never linked or merged. No number is presented as verified, and no `tel:` or `mailto:` links exist.
- Deliberately omitted: coordinates, map pins, directions links, opening hours (including the brief's "08:00–midnight" for Kyanja), "open now", drive-through, delivery coverage and payment methods. NFC card payments and mobile money are not mentioned, so they are not conflated either.
- Generated storefront images are never attached to a branch, and branch pages say the photos don't show that branch.

## Health and data boundaries

- There is no diagnosis, medicine recommendation, dose, alternative or substitution, and no claim that a pharmacist is online. The pharmacist form asks for a short message and tells people to leave out medical history. Urgent symptoms are pointed to a health facility.
- The prescription walk-through has **no file input**. It accepts only the fictional sample, and the page asks people not to share real prescriptions or records.
- Stored on the device: only `neuro-concept-basket` = `{ version, items: [{ id, qty }] }`. React Router also keeps scroll positions (paths and numbers) in sessionStorage. Names, phones, addresses, item enquiries and branch choices exist only in memory. The homepage quick enquiry carries the item name in memory, never in the URL.
