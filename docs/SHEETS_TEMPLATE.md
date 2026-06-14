# Google Sheets CMS Template

Create a Google Spreadsheet with these five sheets. Column headers must match exactly (case-insensitive; converted to camelCase by Apps Script).

## Settings (key-value pairs)

| Key | Value |
|-----|-------|
| businessName | Yash Electronics |
| tagline | Your Trusted Local Electronics Store |
| phone | +91 98765 43210 |
| whatsapp | 919876543210 |
| email | info@yashelectronics.in |
| address | Main Market Road |
| city | Your City |
| state | Maharashtra |
| pincode | 400001 |
| googleMapsUrl | https://maps.google.com/... |
| heroTitle | Electronics & Home Appliances You Can Trust |
| heroSubtitle | Genuine products from trusted brands... |
| heroImage | yash-electronics/hero-banner |
| heroCtaText | Browse Products |
| heroCtaLink | /products |
| workingHours | Mon–Sat: 10 AM – 8 PM |
| facebookUrl | https://facebook.com/... |
| instagramUrl | https://instagram.com/... |
| youtubeUrl | https://youtube.com/... |

## Products

| id | name | slug | brand | brandSlug | category | categorySlug | modelNumber | description | specifications | mrp | offerPrice | images | isFeatured | isActive | createdAt | updatedAt |
|----|------|------|-------|-----------|----------|--------------|-------------|-------------|----------------|-----|------------|--------|------------|----------|-----------|-----------|

**Notes:**
- `images`: pipe-separated Cloudinary public IDs, e.g. `folder/img1|folder/img2`
- `specifications`: JSON string or `Key: Value` lines
- `isFeatured` / `isActive`: TRUE or FALSE

## Categories

| id | name | slug | description | icon | image | sortOrder | isActive |
|----|------|------|-------------|------|-------|-----------|----------|

**icon values:** tv, fridge, washer, microwave, air-fryer, water, ac, cooler, mill, stove, chimney, blender, mixer

## Brands

| id | name | slug | logo | sortOrder | isActive |
|----|------|------|------|-----------|----------|

`logo`: Cloudinary public ID

## Offers

| id | title | slug | type | description | image | discountText | validUntil | isActive | sortOrder |
|----|-------|------|------|-------------|-------|--------------|------------|----------|-----------|

**type values:** combo, bundle, weekly, festival
