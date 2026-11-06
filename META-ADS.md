# Meta ads for Chahd Kids

Use a clean production URL as the ad's website destination. Product IDs are stable catalogue slugs. Copy the link from a product page or find its ID in `dist/products.js`. All example paths below use the existing Worker and its extensionless HTML routing.

| Destination | Example |
| --- | --- |
| Product | `https://chahdkids.com/products/interbaby-blanket` |
| Category | `https://chahdkids.com/categories/feeding` |
| Collection | `https://chahdkids.com/campaigns/baby-essentials` |

In Meta Ads Manager, set the ad destination to **Website** and paste the relevant URL. Add URL parameters in the ad's tracking settings. Use short campaign codes without customer information. For example:

```text
utm_source=instagram&utm_medium=paid_social&utm_campaign=baby-essentials&utm_content=reel-01
```

Use distinct `utm_content` codes for different ads. The URL stays shareable and refreshable. Canonical and sharing metadata exclude campaign parameters.

## Campaign pages and prices

Add an entry to `campaigns.json` with a stable `id`, a `title`, a `description`, and a list of existing product IDs in `products`. Run `npm run build`. The generator creates `/campaigns/<id>` and adds it to the sitemap. Removing an entry removes its generated page on the next build, so pause any ads using that URL first.

Describe actual seasonal or discount terms in the campaign copy. An optional `prices` object maps featured product IDs to approved campaign amounts in MAD. Those amounts appear on the campaign page and in its WhatsApp draft. They do not change the main catalogue. A verified numeric `price` in a catalogue record enables the standard product price; `currency` can be omitted for MAD or set to `MAD`. The current catalogue has no published amounts, so the sample collection and product pages ask shoppers to confirm the price on WhatsApp.

## Consent and browser events

Set the public numeric `META_PIXEL_ID` in the Cloudflare **build environment**, then run `npm run build` and deploy `dist`. A Worker runtime variable alone cannot change already generated HTML. Leave the variable unset to disable the Pixel. Keep one Pixel integration on the site and leave automatic events and automatic advanced matching disabled for this setup in Events Manager.

The Meta script loads only after the visitor allows advertising tracking. The footer privacy control lets visitors change their decision. No browser event includes checkout form fields. The site counts one PageView per document, one ViewContent on a product page, each successful cart addition, and one InitiateCheckout per distinct draft on that page. A WhatsApp handoff never emits Purchase.

If the visitor opts in, campaign codes carry across navigation in the same tab for up to 24 hours and appear in the WhatsApp draft. The shop can record that code alongside its own order ID and paid status. Compare confirmed orders by campaign against Meta's consented visit and checkout events. Drafts and enquiries alone are not orders. No site database is required for this workflow.

## Confirmed Purchase via Conversions API

Use `meta-purchase.mjs` in a private order-processing environment outside the static Worker. It accepts a private JSON record with `status` set to `paid`, `marketingConsent` set to `true` after checking the shop's recorded consent, a stable non-personal `orderId`, the actual ISO `paidAt` timestamp, numeric `value`, `currency` set to `MAD`, and at least one of `phoneSha256` or `emailSha256`. Use Meta's normalized SHA-256 format. Hashes remain sensitive matching data and should be supplied only for appropriately consented customers. Never put raw customer data, hashed customer data, tokens, or order records in this repository or in `dist/`.

Set `META_PIXEL_ID`, `META_ACCESS_TOKEN`, `META_GRAPH_API_VERSION`, and `META_RECEIPT_DIR` privately. Use the supported Graph API version selected for your Meta integration and a durable private receipt directory. The validation command does not send an event:

```sh
npm run meta:purchase -- /private/path/order.json
```

Add `--send` only after checking the paid record. The script uses a stable event ID and an exclusive local receipt to prevent resubmission on the same receipt store. If a receipt is pending after a failed or ambiguous request, reconcile it in Events Manager before clearing it. The browser has no access token and cannot invoke this script.

## Verify in Meta and deploy

In **Events Manager**, select your dataset and open **Test Events**. Launch your ad URL from the website test tool in a fresh browser session. Before consent, verify there are no Meta requests. Allow tracking, view a product, add it to the basket, and submit the WhatsApp draft. Check for PageView, ViewContent, AddToCart, and InitiateCheckout, with the expected product IDs. Check that there is no Purchase from this sequence. Repeat with rejection and after changing the choice in the footer.

For a separate server test, use the test event code shown by Events Manager as `META_TEST_EVENT_CODE` in the private sender. The receipt namespace is separate from production. Verify the server Purchase with the actual amount and MAD currency in Test Events before enabling live reporting. Meta setup references: [Pixel reference](https://developers.facebook.com/docs/meta-pixel/reference/) and [Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api/).

Redeploy the existing Worker after updating its build variables or Git revision. The generated canonical host defaults to `https://chahdkids.com`. Set `SITE_URL` explicitly only when building for a different canonical origin.

```sh
npm run build
npx wrangler deploy --assets ./dist --compatibility-date 2026-11-04
```
