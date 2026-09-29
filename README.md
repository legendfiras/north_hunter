# North Hunter

Storefront for North Hunter (مؤسسة النور). The site opens in English. Arabic is available from the language switch.

The cart does not take payment. Products are added from the dashboard at `/admin`. The catalog holds at most 30 product photos. Replacing a photo does not add another.

Phone and WhatsApp: +961 3 460 697

Instagram and TikTok: @north_hunter_taleb

The logo and hero are in `public/images/north-hunter/`. Product photos shipped with the site are in `public/uploads/`. Dashboard photos and the editable catalog use Vercel Blob and are served from `/media/`.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Vercel for the app
- Vercel Blob for the editable catalog and dashboard uploads

## Run locally

```bash
npm install
npm run build
npm start
```

Without Blob configuration, local development reads `data/catalog.json` and saves new photos to `public/uploads/`. Copy `.env.example` to `.env.local` and set the Blob and admin values to use the production storage locally.

English: http://localhost:3000/en

Production is indexable. `/robots.txt` blocks `/admin` and `/api/` and points to `/sitemap.xml`, which lists every page, category and product in both languages. Preview deployments stay `noindex`.

## Google Search Console

1. Add a **Domain** property for `roytech.solutions` (DNS TXT record in Porkbun) or a **URL prefix** property for `https://north-hunter-taleb.roytech.solutions`.
2. For the URL-prefix HTML-tag method, copy only the `content` value into the `GOOGLE_SITE_VERIFICATION` Production env var and redeploy.
3. Under **Sitemaps**, submit `sitemap.xml`.

## Deploy on Vercel

Connect a **Public Vercel Blob store** to the Vercel project (Storage → Create → Blob). Vercel provides `BLOB_READ_WRITE_TOKEN` to the project; do not put it in git. The public store contains only product data and images. Browser uploads are authorized by the admin session before Blob issues an upload token.

Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a long random `ADMIN_SESSION_SECRET` as sensitive Production environment variables. The old hardcoded admin credentials are removed. Set all three before exposing the dashboard.

Before using the dashboard on the new deployment, migrate any live catalog changes in R2. With the R2 S3 credentials and Blob token set locally, run `node --env-file=.env.local scripts/migrate-r2-to-blob.mjs`. The script reads `catalog.json` and referenced `files/` images, verifies product/category counts, refuses to overwrite an existing Blob catalog, and never deletes R2 objects. If R2 is unavailable and you verify the four products in `data/catalog.json` are the complete catalog, run `node --env-file=.env.local scripts/bootstrap-blob-from-seed.mjs --confirm-seed`. Until one of those steps succeeds, the site displays the checked-in seed but the dashboard refuses writes to avoid replacing an unmigrated catalog.

```bash
npx vercel deploy --prod
```

The production hostname is `north-hunter-taleb.roytech.solutions`. Add that domain in the Vercel project and copy the CNAME target Vercel shows into Porkbun. Leave the nameservers at Porkbun.

The previous Cloudflare Worker stays in place until this hostname is serving the Vercel deployment. Do not run a Workers deploy for this site.
