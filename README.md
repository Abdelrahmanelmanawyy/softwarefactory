# Software Fabrika

Marketing site for Software Fabrika: websites and apps "manufactured" in days.
Turkish (default), English and Arabic (RTL).

- `/` redirects to `/tr`; pages live at `/tr`, `/en`, `/ar`.
- Hero: the sample website assembles itself on a production line, then cycles through sectors.
- Order desk: visitors configure sector, package, style and features, see the live price and
  delivery date, and send the order to WhatsApp. The configuration is kept in the URL so it can be shared.

## Edit content

| What | Where |
| --- | --- |
| WhatsApp number | `WHATSAPP_NUMBER` in `src/lib/catalog.ts` |
| Prices, delivery days, add-ons | `src/lib/catalog.ts` |
| All text (TR / EN / AR) | `src/i18n/dictionaries/*.ts` |
| Colours, fonts, layout | `src/app/globals.css` |
| Logo | `src/components/Logo.tsx` |

## Develop

```bash
npm install
npm run dev        # http://localhost:3000/tr
npm run build      # static export into ./out
npx wrangler dev   # serve ./out like Cloudflare does (with the / -> /tr redirect)
```

## Deploy (Cloudflare Workers)

Static export served as Workers static assets (`wrangler.jsonc`).

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler versions upload`
