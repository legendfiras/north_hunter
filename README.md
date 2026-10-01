# North Hunter

Storefront for North Hunter (مؤسسة النور). The site opens in English. Arabic is available from the language switch.

The cart does not take payment. Products are managed from `/admin`. The catalog holds at most 30 product photos.

Phone and WhatsApp: +961 3 460 697

Instagram and TikTok: @north_hunter_taleb

## Architecture

- Next.js 16 and React 19 deployed on Vercel
- Cloudflare R2 for the production `catalog.json` and dashboard product images
- Short-lived, authenticated presigned R2 PUT URLs for browser uploads
- `R2_PUBLIC_BASE_URL` for public product-image URLs

The logo and hero remain checked-in assets under `public/images/north-hunter/`. The four fallback products and their source images under `public/uploads/` are used only to initialize R2.

## Environment

Set these server-side variables in Vercel and in an untracked `.env.local` when initializing R2:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Never prefix credentials with `NEXT_PUBLIC_` and never commit `.env.local`.

## Initialize R2 from the fallback catalog

Review the non-writing plan first:

```bash
npm run init:r2 -- --dry-run
```

Initialize an empty bucket:

```bash
npm run init:r2 -- --confirm
```

If `catalog.json` already exists from the superseded deployment and the dry run confirms it should be replaced with the four fallback products:

```bash
npm run init:r2 -- --confirm --replace-existing-catalog
```

The initializer uploads and reads back every image, then writes and verifies `catalog.json`. It never reads Vercel Blob and never deletes existing R2 objects. A marker prevents a later rerun from overwriting a catalog changed through the admin dashboard.

## Configure browser-upload CORS

The repository CORS policy permits the production hostname and `http://localhost:3000`. Apply and verify it with:

```bash
npx wrangler r2 bucket cors set "$env:R2_BUCKET_NAME" --file r2-cors.json
npx wrangler r2 bucket cors list "$env:R2_BUCKET_NAME"
```

## Local verification

```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
npm start
```

English: http://localhost:3000/en

The site is indexable and publishes `/sitemap.xml`. The application remains deployed on Vercel; R2 is storage only.
