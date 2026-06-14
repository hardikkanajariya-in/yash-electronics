# Yash Electronics — Product Catalog Platform

Production-ready electronics retail catalog built with Astro, TypeScript, and Tailwind CSS. CMS-driven via Google Sheets, images via Cloudinary, deployed on Vercel.

## Quick Start

```bash
pnpm install
cp .env.example .env
# For local preview without CMS:
# USE_MOCK_DATA=true
pnpm dev
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Astro 6, TypeScript, Tailwind CSS 3 |
| CMS | Google Sheets + Apps Script API |
| Images | Cloudinary |
| Hosting | Vercel |

## Project Structure

```
src/
├── components/     # Reusable UI (layout, product, home, seo)
├── config/         # Site & Cloudinary config
├── features/       # Catalog filters, WhatsApp messaging
├── layouts/        # BaseLayout with header/footer
├── lib/            # Cloudinary, formatting utilities
├── pages/          # Routes (home, products, category, offers)
├── services/       # CMS data layer (Google Sheets API)
└── types/          # TypeScript interfaces

google-apps-script/ # Apps Script for Sheets API
docs/               # Deployment guide & sheet templates
```

## Pages

- `/` — Homepage (hero, categories, featured products, brands, offers, trust, contact)
- `/products` — Full catalog with search, filters, sorting
- `/products/[slug]` — Product detail with WhatsApp enquiry
- `/category/[slug]` — Category listing
- `/offers` — Special offers (combo, bundle, weekly, festival)
- `/contact` — Store contact & WhatsApp

## CMS Setup

1. Create Google Spreadsheet with sheets: Products, Categories, Brands, Offers, Settings
2. Deploy `google-apps-script/Code.gs` as web app
3. Set `SHEETS_API_URL` and `SHEETS_API_KEY` in environment

See [docs/SHEETS_TEMPLATE.md](./docs/SHEETS_TEMPLATE.md) for column structure.

## Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full Vercel deployment guide.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SITE_URL` | Yes | Production site URL |
| `SHEETS_API_URL` | Prod | Google Apps Script URL |
| `SHEETS_API_KEY` | Prod | API authentication key |
| `PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `USE_MOCK_DATA` | Dev | `true` for local without CMS |

## Scripts

```bash
pnpm dev      # Development server
pnpm build    # Static production build
pnpm preview  # Preview production build
```
