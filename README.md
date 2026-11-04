# chahd.kids

Arabic storefront for children's clothing and essentials, based in Tangier, Morocco. Responsive RTL design, six categories, searchable catalogue, product details, favorites and a browser-local cart with a WhatsApp inquiry handoff.

## Local preview

Requires Node.js. No packages need to be installed.

```sh
npm run dev
```

Open http://127.0.0.1:5184. To check JavaScript syntax, run `npm run check`. The ready-to-serve website is in `dist/` and can also be opened directly from `dist/index.html`.

## Deploy on Cloudflare Pages

Connect this GitHub repository in Cloudflare's **Workers & Pages → Create application → Pages → Import an existing Git repository**.

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Production branch | `main` |
| Build command | `exit 0` |
| Build output directory | `dist` |
| Root directory | Repository root; leave blank |
| Environment variables | None |

The project needs no backend, database, API keys or paid runtime. Cloudflare's Free plan limits apply. After the initial connection, pushes to `main` automatically deploy. The actual `pages.dev` address is assigned by Cloudflare after deployment.

Official references: [Cloudflare static HTML deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) and [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/).

GitHub hosts the source. Do not enable GitHub Pages for this storefront: [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) exclude websites primarily facilitating commercial transactions.

## Catalogue and contact

- Edit categories, catalogue items and options in `dist/app.js`.
- Edit content and contact links in `dist/index.html` and `dist/app.js`.
- Edit the visual design in `dist/style.css`.
- Store product photos in `dist/assets/` and update the corresponding image paths.
- `npm run assets` regenerates the original SVG product illustrations.

Catalogue entries and images are illustrative. Confirm actual product photographs, models, prices, size options and stock with the shop before retail launch. No stock, reviews, delivery fees or payment/return promises are fabricated. The shop contact and Tangier location were supplied in the original HTML.

The cart and favorites are saved in the visitor's browser when storage is available. Customer fields are not persisted. Submitting an inquiry opens a WhatsApp draft; the visitor must send the message in WhatsApp. Nothing is ordered or paid automatically.

Hero photograph: [Unsplash image](https://images.unsplash.com/photo-1522771930-78848d9293e8). Product artwork: original SVG illustrations included with the source.
