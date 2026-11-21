# Software Fabrika

Marketing site for Software Fabrika: websites and apps "manufactured" in days.
Turkish (default), English and Arabic (RTL).

- `/` redirects to `/tr`; pages live at `/tr`, `/en`, `/ar`.
- Hero: the sample website assembles itself on a production line, then cycles through sectors.
- Order desk: one question at a time (business, name, design, palette, style, size, features, speed).
  Every answer rebuilds the laptop and phone previews and the price. The last step is the order
  ticket, sent by WhatsApp or e-mail. The answers are kept in the URL so an order can be shared.
- Templates: one real sample website per sector, with photos. Each is also a full-screen page at
  `/<lang>/demo/<sector>` (for example `/tr/demo/gym?n=PowerGym`).

## Edit content

| What | Where |
| --- | --- |
| WhatsApp number | `WHATSAPP_NUMBER` in `src/lib/catalog.ts` |
| E-mail orders | `WEB3FORMS_KEY` (free key from web3forms.com) or `ORDER_EMAIL` in `src/lib/catalog.ts` |
| Launch offer: on/off, percent, places left, end date (lower `placesLeft` after each sale) | `OFFER` in `src/lib/catalog.ts` |
| Prices in each currency (TRY default, USD, EGP), delivery days | `PRICES` in `src/lib/catalog.ts` |
| All text, including the sample websites (TR / EN / AR) | `src/i18n/dictionaries/*.ts` |
| Template photos | `public/photos/<sector>/` (1 = hero, 2-5 = sections; `-sm` = 640px copy). Sources in `public/photos/CREDITS.md` |
| Site colours, fonts, layout | `src/app/globals.css` |
| Template design | `src/app/template.css` and `src/components/MockSite.tsx` |
| Order desk design | `src/app/quiz.css` and `src/components/Configurator.tsx` |
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
