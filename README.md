# North Hunter

Storefront for North Hunter (مؤسسة النور). The site opens in English. Arabic is available from the language switch.

The cart does not take payment. Products are added from the dashboard at `/admin`. The catalog holds at most 30 product photos. Replacing a photo does not add another.

Phone and WhatsApp: +961 3 460 697

Instagram and TikTok: @north_hunter_taleb

The logo and hero are in `public/images/north-hunter/`. Product photos shipped with the site are in `public/uploads/` and are served as static files. Photos added from the dashboard are stored in the existing Cloudflare R2 bucket `north-hunter-media` and served from `/media/`.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Vercel for the app
- Cloudflare R2 for the catalog and dashboard uploads, through the S3-compatible API

## Run locally

```bash
npm install
npm run build
npm start
```

Without the R2 variables, the catalog is stored in `data/catalog.json` and new photos are stored in `public/uploads/`. Copy `.env.example` to `.env.local` and fill in the R2 values to use the same bucket as production.

English: http://localhost:3000/en

The site is marked `noindex`.

## Deploy on Vercel

Do not create or delete the R2 bucket. The app reads and writes the existing `catalog.json` object and `files/` photos.

Set these server environment variables from `.env.example`:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME` (`north-hunter-media`)

Create the access key in the Cloudflare dashboard for the existing bucket. Do not put the secret in git.

Browser uploads go directly to R2 with a short-lived signed URL. Apply `r2-cors.json` to that bucket so the browser is allowed to upload:

```bash
npx wrangler r2 bucket cors set north-hunter-media --file r2-cors.json
```

That command changes CORS only. It does not delete objects.

```bash
npx vercel deploy --prod
```

The production hostname is `north-hunter-taleb.roytech.solutions`. Add that domain in the Vercel project and copy the CNAME target Vercel shows into Porkbun. Leave the nameservers at Porkbun.

The previous Cloudflare Worker stays in place until this hostname is serving the Vercel deployment. Do not run a Workers deploy for this site.
