# chahd.kids

Arabic, RTL storefront based on the supplied HTML. The original is preserved in `original.html`. The deployable website is in `dist/`; it also opens directly from `dist/index.html`.

Run `npm run dev` for a preview on http://127.0.0.1:5184 and `npm run check` for a JavaScript syntax check. No dependencies or build step required. `npm run assets` regenerates the original SVG illustrations.

The catalogue contains shop-supplied product photos. No prices, stock, reviews, delivery fees, payment or return promises are invented. WhatsApp contact and Tangier location are retained from the original document. All WhatsApp handoffs require a visitor click; the cart stays available after handoff. Nothing is ordered or paid on this site.

Categories live in `dist/app.js`; product records and options live in `dist/products.js`. Branding and contact links are in `dist/index.html` and `dist/app.js`. Cart and favorites are stored locally when available; customer name/city/notes are not saved. Customer information is placed in a WhatsApp draft only after submitting the inquiry form. The customer must send that message in WhatsApp.

Hero photo: [Unsplash image](https://images.unsplash.com/photo-1522771930-78848d9293e8). Product illustrations are original SVGs.

## Shop-supplied products

`dist/products.js` contains 69 products using 74 shop-supplied images, grouped into six categories. Multiple photographs of the same Monbobo system and Inter Baby blanket are grouped into galleries. The previous illustrative sample cards have been replaced by the real catalogue. WebP assets retain the original frame and dimensions. Product images open quick details; titles lead to dedicated product pages.

Prices, availability, sizes and specifications are confirmed with the shop. Descriptions identify the photographed item without adopting promotional efficacy or certification claims.

## Automatic website translation

The language selector offers 73 languages through the locally vendored MIT-licensed translate.js client.edge integration. It translates page text, product details, cart labels, placeholders and accessible labels on demand, remembers the selected language, and sets the correct page language and RTL/LTR direction. Returning to Arabic restores the original copy. Translated product titles are included in product search. The WhatsApp inquiry includes the visitor's preferred language; product selections retain their original identifiers and Arabic wording for the shop.

Public website text is sent to the external Microsoft Edge translation endpoint when another language is selected. Customer name, city and note values are excluded from translation; only their static placeholders are eligible. The logo and language selector are excluded. Network errors show a retry option and an Arabic-original button; translation requires a working Internet connection and the provider's availability. Machine translations can be approximate and do not create separately indexed language URLs.

Vendor source: https://github.com/xnx3/translate/blob/master/translate.js/translate.js. Snapshot version: `4.1.0.20260526`; SHA-256: `44ef0a9325c75ab2dd038616cfeb19b15dae46d04cbad9a4cbae8b45c67eba3a`. The license is retained in `dist/vendor/translate-LICENSE.txt`. No user account, payment method, or translation API key was configured.

Translation configuration lives in `dist/languages.js`. Use `node --check dist/languages.js` to validate its syntax. Browser QA covered live English/French/Spanish translation, dynamic product details, translated search, persistence, four viewport widths, form privacy, restoring Arabic, and network-failure recovery.

## Boutique category index

Category navigation uses numbered rows and an asymmetric photo composition in dist/categories.css. Featured store photographs link to the outdoor and sleep departments. Kidilo beige bed and black/gold stroller entries use the additional shop-supplied images; brand identity and technical specifications are not guessed. All six department filters remain available on desktop and mobile.

## Global product search

The header search icon opens a labelled search form with submit, clear and close controls. Search always covers the entire catalogue, including after a department or favorites view was selected. Typing, submitting and pressing Enter reveal the results below the current sticky header without navigating or reloading the page. Department navigation clears a previous search. Matching handles multiple words in either order, Latin accents, Arabic diacritics, brand names, product identifiers and translated product text. Escape closes the panel and returns focus to the icon.

## SEO and static pages

Run `npm run seo` after changing product records. `build-seo.mjs` generates 69 static product pages, six category pages, a 76-URL image sitemap, robots.txt, canonical links, social sharing metadata, Store/WebSite schema, Product schema and breadcrumbs. The homepage includes real product and category links before JavaScript runs. No prices, ratings or stock values are fabricated; Product markup without offers/reviews is not claimed to qualify for Google product rich results.

The default canonical origin is https://chahd-kids.avidlemon1.chatgpt.site. When moving to Cloudflare or a custom domain, set SITE_URL to the final HTTPS origin and rerun `npm run seo` before deployment. Configure any domain redirects at the hosting provider; keep a single canonical site. Automatic translations do not generate separate language URLs, so no hreflang alternates are declared.

Public access is necessary for indexing. In Search Console, verify ownership of the final public domain and submit `/sitemap.xml`; no Search Console property or submission has been created by this source change. Indexing and rankings are not guaranteed.

Primary references: [Google technical requirements](https://developers.google.com/search/docs/essentials/technical), [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

## Cloudflare Worker deployment

Use a full checkout of `main` as the build root. The original styles, translation scripts, and images are tracked under `dist/`. The SEO generator updates the HTML and sitemap in place. Keep the rest of `dist/` when preparing the upload.

Run `npm run build` before each deployment. It checks JavaScript syntax, regenerates the SEO pages, and fails if a referenced local asset or page is missing, empty, or has mismatched filename casing. Run `npm run check:assets` to validate a prepared `dist/` without regenerating pages.

From the repository root, run the following commands against the existing Worker. Continue to the deploy command only if the build passes.

```sh
npm run build
npx wrangler deploy --assets ./dist --compatibility-date 2026-11-04
```

For a Git-connected Worker, use `npm run build` as its build command and keep the existing Wrangler command as its deploy command. Cloudflare serves the assets from the deployed version, so a GitHub update takes effect after a deployment succeeds.
