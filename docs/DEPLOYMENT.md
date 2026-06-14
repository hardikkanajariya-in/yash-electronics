# Deployment Guide — Yash Electronics

## Prerequisites

- Node.js 22.12+
- pnpm
- Google account (for Sheets CMS)
- Cloudinary account
- Vercel account

---

## 1. Google Sheets CMS

1. Create a new Google Spreadsheet
2. Add sheets: `Products`, `Categories`, `Brands`, `Offers`, `Settings`
3. Copy column structure from [docs/SHEETS_TEMPLATE.md](./SHEETS_TEMPLATE.md)
4. Upload product images to Cloudinary; use public IDs in sheet columns

### Google Apps Script

1. Open spreadsheet → **Extensions → Apps Script**
2. Paste contents of `google-apps-script/Code.gs`
3. **Project Settings → Script Properties** → add `API_KEY` (any secret string)
4. **Deploy → New deployment → Web app**
   - Execute as: Me
   - Who has access: Anyone
5. Copy the deployment URL

---

## 2. Cloudinary

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Upload images under folder `yash-electronics/`
3. Note your **cloud name**
4. Use public IDs in Google Sheets (not full URLs)

Image transforms are applied automatically via `src/lib/cloudinary.ts`.

---

## 3. Environment Variables

Copy `.env.example` to `.env` (local) or add in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `PUBLIC_SITE_URL` | Production URL, e.g. `https://yashelectronics.in` |
| `SHEETS_API_URL` | Google Apps Script web app URL |
| `SHEETS_API_KEY` | Same key as Script Properties `API_KEY` |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `USE_MOCK_DATA` | `false` in production |

---

## 4. Local Development

```bash
pnpm install
cp .env.example .env
# Set USE_MOCK_DATA=true for local preview without CMS
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321)

---

## 5. Build

```bash
# Production build (requires SHEETS_API_URL or USE_MOCK_DATA=true)
pnpm build
pnpm preview
```

Static pages are generated at build time from CMS data.

---

## 6. Deploy to Vercel

### Option A: Vercel CLI

```bash
pnpm add -g vercel
vercel
```

### Option B: Git Integration

1. Push repo to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Framework preset: **Astro**
4. Add environment variables from section 3
5. Deploy

`vercel.json` is included with Mumbai region (`bom1`) for Indian audience.

---

## 7. Post-Deploy Checklist

- [ ] Verify homepage loads with live CMS data
- [ ] Test product search and filters
- [ ] Test WhatsApp enquiry links on product pages
- [ ] Confirm sitemap at `/sitemap-index.xml`
- [ ] Confirm robots.txt at `/robots.txt`
- [ ] Run Lighthouse audit (target 95+)
- [ ] Submit sitemap to Google Search Console

---

## 8. Updating Content

1. Edit Google Sheets
2. Redeploy site (Vercel rebuild on git push, or manual redeploy)
3. No code changes needed for product/offer updates

For automatic rebuilds on sheet changes, add a time-based Apps Script trigger or webhook to Vercel deploy hook.

---

## 9. Performance Tips

- Use Cloudinary `f_auto,q_auto` (handled automatically)
- Keep hero images under 200KB source
- Limit products per sheet to reasonable batch sizes
- Enable Vercel caching for static assets

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails with CMS error | Check `SHEETS_API_URL` and `SHEETS_API_KEY` |
| Images not loading | Verify Cloudinary public IDs and `PUBLIC_CLOUDINARY_CLOUD_NAME` |
| Empty product pages | Ensure `isActive` is TRUE in sheet |
| WhatsApp link broken | `whatsapp` field must be digits only, e.g. `919876543210` |
