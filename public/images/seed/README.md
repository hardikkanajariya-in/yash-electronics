# Seed Image Assets

Local images for mock CMS preview (`USE_MOCK_DATA=true`).

## Contents

| Folder | Count | Description |
|--------|-------|-------------|
| `hero.jpg` | 1 | Homepage hero banner |
| `categories/` | 13 | Category thumbnails |
| `products/` | 9 | Product photos |
| `offers/` | 4 | Offer banners |
| `brands/` | 14 | Brand logo SVGs |

## Regenerate

```bash
pnpm seed:images
```

Photos are downloaded from [LoremFlickr](https://loremflickr.com) using thematic tags (television, refrigerator, etc.). Brand logos are generated SVG wordmarks for demo purposes only — replace with official brand assets in production.

## Production

In production, upload images to Cloudinary and reference public IDs in Google Sheets. These local files are not used when `SHEETS_API_URL` is configured.
