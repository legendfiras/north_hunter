# North Hunter

Storefront for North Hunter (مؤسسة النور). The site opens in English. Arabic is available from the language switch.

The cart does not take payment. Products are added from the dashboard at `/admin`. The catalog holds at most 30 product photos. Replacing a photo does not add another.

Phone and WhatsApp: +961 3 460 697

Instagram and TikTok: @north_hunter_taleb

The logo and hero are in `public/images/north-hunter/`. Product photos already on the site are in `public/uploads/`. New photos added on Cloudflare are stored in the `north-hunter-media` R2 bucket and served from `/media/`.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Cloudflare Workers via `@opennextjs/cloudflare`

## Run locally

```bash
npm install
npm run build
npm start
```

English: http://localhost:3000/en

The site is marked `noindex`.

## Deploy

Log in to Cloudflare, create the media bucket once, then deploy:

```bash
npx wrangler login
npx wrangler r2 bucket create north-hunter-media
npm run deploy
```
