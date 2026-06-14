import fs from 'fs';
import path from 'path';
import pg from 'pg';

// 1. Load environment variables from .env
try {
  const envPath = path.resolve(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  }
} catch (e) {
  console.warn('[Seed] Could not read .env file, using existing process.env variables.');
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[Seed] Error: DATABASE_URL environment variable is missing.');
  process.exit(1);
}

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const client = new pg.Client({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Mock Seed Data
const settings = {
  businessName: 'Yash Electronics',
  tagline: 'Your Trusted Local Electronics Store',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'info@yashelectronics.in',
  address: 'Main Market Road, Near City Bus Stand',
  city: 'Your City',
  state: 'Maharashtra',
  pincode: '400001',
  googleMapsUrl: 'https://maps.google.com',
  heroTitle: 'Electronics & Home Appliances You Can Trust',
  heroSubtitle: 'Genuine products from Sony, Samsung, Haier, IFB, Natraj, Daikin & more. Local service, competitive pricing for families across nearby towns.',
  heroImage: '/images/seed/hero.jpg',
  heroCtaText: 'Browse Products',
  heroCtaLink: '/products',
  workingHours: 'Mon–Sat: 10:00 AM – 8:00 PM | Sun: 10:00 AM – 2:00 PM',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',
};

const categories = [
  { id: '1', name: 'LED TV', slug: 'led-tv', description: 'Smart & HD TVs', icon: 'tv', image: '/images/seed/categories/led-tv.jpg', sortOrder: 1, isActive: true },
  { id: '2', name: 'Refrigerator', slug: 'refrigerator', description: 'Single & double door', icon: 'fridge', image: '/images/seed/categories/refrigerator.jpg', sortOrder: 2, isActive: true },
  { id: '3', name: 'Washing Machine', slug: 'washing-machine', description: 'Front & top load', icon: 'washer', image: '/images/seed/categories/washing-machine.jpg', sortOrder: 3, isActive: true },
  { id: '4', name: 'Microwave', slug: 'microwave', description: 'Solo & convection', icon: 'microwave', image: '/images/seed/categories/microwave.jpg', sortOrder: 4, isActive: true },
  { id: '5', name: 'Air Fryer', slug: 'air-fryer', description: 'Healthy cooking', icon: 'air-fryer', image: '/images/seed/categories/air-fryer.jpg', sortOrder: 5, isActive: true },
  { id: '6', name: 'RO System', slug: 'ro-system', description: 'Water purifiers', icon: 'water', image: '/images/seed/categories/ro-system.jpg', sortOrder: 6, isActive: true },
  { id: '7', name: 'Air Conditioner', slug: 'air-conditioner', description: 'Split & window AC', icon: 'ac', image: '/images/seed/categories/air-conditioner.jpg', sortOrder: 7, isActive: true },
  { id: '8', name: 'Air Cooler', slug: 'air-cooler', description: 'Desert & personal', icon: 'cooler', image: '/images/seed/categories/air-cooler.jpg', sortOrder: 8, isActive: true },
  { id: '9', name: 'Gharghanti', slug: 'gharghanti', description: 'Flour mills', icon: 'mill', image: '/images/seed/categories/gharghanti.jpg', sortOrder: 9, isActive: true },
  { id: '10', name: 'Gas Stove', slug: 'gas-stove', description: '2 & 4 burner', icon: 'stove', image: '/images/seed/categories/gas-stove.jpg', sortOrder: 10, isActive: true },
  { id: '11', name: 'Chimney', slug: 'chimney', description: 'Kitchen chimneys', icon: 'chimney', image: '/images/seed/categories/chimney.jpg', sortOrder: 11, isActive: true },
  { id: '12', name: 'Blender', slug: 'blender', description: 'Hand & jar blenders', icon: 'blender', image: '/images/seed/categories/blender.jpg', sortOrder: 12, isActive: true },
  { id: '13', name: 'Mixer Grinder', slug: 'mixer-grinder', description: 'Juicer mixer grinders', icon: 'mixer', image: '/images/seed/categories/mixer-grinder.jpg', sortOrder: 13, isActive: true },
];

const brands = [
  { id: '1', name: 'Sony', slug: 'sony', logo: '/images/seed/brands/sony.svg', sortOrder: 1, isActive: true },
  { id: '2', name: 'Samsung', slug: 'samsung', logo: '/images/seed/brands/samsung.svg', sortOrder: 2, isActive: true },
  { id: '3', name: 'Haier', slug: 'haier', logo: '/images/seed/brands/haier.svg', sortOrder: 3, isActive: true },
  { id: '4', name: 'IFB', slug: 'ifb', logo: '/images/seed/brands/ifb.svg', sortOrder: 4, isActive: true },
  { id: '5', name: 'Iwis', slug: 'iwis', logo: '/images/seed/brands/iwis.svg', sortOrder: 5, isActive: true },
  { id: '6', name: 'CLT', slug: 'clt', logo: '/images/seed/brands/clt.svg', sortOrder: 6, isActive: true },
  { id: '7', name: 'Trion', slug: 'trion', logo: '/images/seed/brands/trion.svg', sortOrder: 7, isActive: true },
  { id: '8', name: 'Komfy', slug: 'komfy', logo: '/images/seed/brands/komfy.svg', sortOrder: 8, isActive: true },
  { id: '9', name: 'Daikin', slug: 'daikin', logo: '/images/seed/brands/daikin.svg', sortOrder: 9, isActive: true },
  { id: '10', name: 'Voltas', slug: 'voltas', logo: '/images/seed/brands/voltas.svg', sortOrder: 10, isActive: true },
  { id: '11', name: 'Mitsubishi Heavy', slug: 'mitsubishi-heavy', logo: '/images/seed/brands/mitsubishi-heavy.svg', sortOrder: 11, isActive: true },
  { id: '12', name: 'Blue Star', slug: 'blue-star', logo: '/images/seed/brands/blue-star.svg', sortOrder: 12, isActive: true },
  { id: '13', name: 'Natraj', slug: 'natraj', logo: '/images/seed/brands/natraj.svg', sortOrder: 13, isActive: true },
  { id: '14', name: 'Ivas', slug: 'ivas', logo: '/images/seed/brands/ivas.svg', sortOrder: 14, isActive: true },
];

const products = [
  {
    id: 'p1',
    name: 'Sony Bravia 55" 4K Ultra HD Smart LED TV',
    slug: 'sony-bravia-55-4k-smart-led-tv',
    brandId: '1',
    categoryId: '1',
    modelNumber: 'KD-55X75L',
    description: 'Experience stunning 4K picture quality with Google TV, Dolby Audio and seamless streaming.',
    specifications: '{"Screen Size":"55 inch","Resolution":"4K Ultra HD","Smart TV":"Google TV","Refresh Rate":"60Hz","Warranty":"1 Year"}',
    mrp: 89990,
    offerPrice: 74990,
    images: ['/images/seed/products/sony-tv-1.jpg', '/images/seed/products/sony-tv-2.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-01-15',
    updatedAt: '2026-03-01',
  },
  {
    id: 'p2',
    name: 'Samsung 253L Frost Free Double Door Refrigerator',
    slug: 'samsung-253l-frost-free-refrigerator',
    brandId: '2',
    categoryId: '2',
    modelNumber: 'RT28C3732S8',
    description: 'Digital Inverter technology with toughened glass shelves and optimal fresh food storage.',
    specifications: '{"Capacity":"253 Litres","Type":"Double Door","Energy Rating":"3 Star","Cooling":"Frost Free","Warranty":"1 Year"}',
    mrp: 32990,
    offerPrice: 27990,
    images: ['/images/seed/products/samsung-fridge-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-01-20',
    updatedAt: '2026-02-15',
  },
  {
    id: 'p3',
    name: 'IFB 7 kg Front Load Washing Machine',
    slug: 'ifb-7kg-front-load-washing-machine',
    brandId: '4',
    categoryId: '3',
    modelNumber: 'SERENA WXN 7012',
    description: 'Aqua Energie, Cradle Wash for delicates and 15 wash programs for every fabric.',
    specifications: '{"Capacity":"7 kg","Type":"Front Load","Energy Rating":"5 Star","Programs":"15","Warranty":"4 Years"}',
    mrp: 42990,
    offerPrice: 36490,
    images: ['/images/seed/products/ifb-washer-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-02-01',
    updatedAt: '2026-03-10',
  },
  {
    id: 'p4',
    name: 'Daikin 1.5 Ton 3 Star Split AC',
    slug: 'daikin-1-5-ton-split-ac',
    brandId: '9',
    categoryId: '7',
    modelNumber: 'FTKL50UV16W',
    description: 'Power chill operation, Econo mode and copper condenser for efficient cooling.',
    specifications: '{"Capacity":"1.5 Ton","Type":"Split AC","Energy Rating":"3 Star","Refrigerant":"R-32","Warranty":"1 Year"}',
    mrp: 45990,
    offerPrice: 38990,
    images: ['/images/seed/products/daikin-ac-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-02-10',
    updatedAt: '2026-03-05',
  },
  {
    id: 'p5',
    name: 'Haier 20L Convection Microwave Oven',
    slug: 'haier-20l-convection-microwave',
    brandId: '3',
    categoryId: '4',
    modelNumber: 'HIL2001CBSH',
    description: 'Convection cooking with auto cook menus and stainless steel cavity.',
    specifications: '{"Capacity":"20 Litres","Type":"Convection","Power":"1200W","Cavity":"Stainless Steel","Warranty":"1 Year"}',
    mrp: 12990,
    offerPrice: 9990,
    images: ['/images/seed/products/haier-microwave-1.jpg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-02-15',
    updatedAt: '2026-02-20',
  },
  {
    id: 'p6',
    name: 'Voltas 50L Desert Air Cooler',
    slug: 'voltas-50l-desert-air-cooler',
    brandId: '10',
    categoryId: '8',
    modelNumber: 'Victo 50',
    description: 'High air delivery with honeycomb pads and 3-speed control for hot summers.',
    specifications: '{"Tank Capacity":"50 Litres","Type":"Desert Cooler","Speed Levels":"3","Air Delivery":"3650 m³/hr","Warranty":"1 Year"}',
    mrp: 11990,
    offerPrice: 9490,
    images: ['/images/seed/products/voltas-cooler-1.jpg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-03-01',
    updatedAt: '2026-03-01',
  },
  {
    id: 'p7',
    name: 'Blue Star 1 Ton 3 Star Split AC',
    slug: 'blue-star-1-ton-split-ac',
    brandId: '12',
    categoryId: '7',
    modelNumber: 'IC312YNUR',
    description: 'Precision cooling with hidden display and turbo cool mode.',
    specifications: '{"Capacity":"1 Ton","Type":"Split AC","Energy Rating":"3 Star","Refrigerant":"R-32","Warranty":"1 Year"}',
    mrp: 36990,
    offerPrice: 31990,
    images: ['/images/seed/products/blue-star-ac-1.jpg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-03-05',
    updatedAt: '2026-03-05',
  },
  {
    id: 'p8',
    name: 'Samsung 28L Convection Microwave',
    slug: 'samsung-28l-convection-microwave',
    brandId: '2',
    categoryId: '4',
    modelNumber: 'CE1041DSB2',
    description: 'Slim fry technology with tandoor and fermentation modes.',
    specifications: '{"Capacity":"28 Litres","Type":"Convection","Power":"1400W","Features":"Slim Fry","Warranty":"1 Year"}',
    mrp: 18990,
    offerPrice: 15490,
    images: ['/images/seed/products/samsung-microwave-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-03-08',
    updatedAt: '2026-03-08',
  },
];

const offers = [
  {
    id: 'o1',
    title: 'TV + Soundbar Combo',
    slug: 'tv-soundbar-combo',
    type: 'combo',
    description: 'Buy any 43"+ LED TV and get soundbar at special combo price.',
    image: '/images/seed/offers/combo-tv.jpg',
    discountText: 'Save up to ₹8,000',
    validUntil: '2026-06-30',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'o2',
    title: 'Build Your Kitchen Bundle',
    slug: 'kitchen-bundle',
    type: 'bundle',
    description: 'Mix chimney, gas stove & mixer grinder for extra savings.',
    image: '/images/seed/offers/kitchen-bundle.jpg',
    discountText: 'Bundle & Save 15%',
    validUntil: '2026-07-31',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'o3',
    title: 'AC Offer Of The Week',
    slug: 'ac-offer-week',
    type: 'weekly',
    description: 'Selected 1.5 Ton split ACs at lowest price this week only.',
    image: '/images/seed/offers/ac-weekly.jpg',
    discountText: 'From ₹32,990',
    validUntil: '2026-06-21',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'o4',
    title: 'Monsoon Festival Sale',
    slug: 'monsoon-festival-sale',
    type: 'festival',
    description: 'Special discounts on refrigerators, washers & RO systems.',
    image: '/images/seed/offers/festival.jpg',
    discountText: 'Up to 25% Off',
    validUntil: '2026-08-15',
    isActive: true,
    sortOrder: 4,
  },
];

async function seed() {
  console.log('[Seed] Connecting to database...');
  await client.connect();

  try {
    // Begin Transaction
    await client.query('BEGIN');

    console.log('[Seed] Clearing existing data...');
    await client.query('DELETE FROM settings');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM brands');
    await client.query('DELETE FROM offers');

    console.log('[Seed] Inserting settings...');
    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, String(value)]
      );
    }

    console.log('[Seed] Inserting categories...');
    for (const category of categories) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description, icon, image, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [category.id, category.name, category.slug, category.description, category.icon, category.image, category.sortOrder, category.isActive]
      );
    }

    console.log('[Seed] Inserting brands...');
    for (const brand of brands) {
      await client.query(
        `INSERT INTO brands (id, name, slug, logo, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [brand.id, brand.name, brand.slug, brand.logo, brand.sortOrder, brand.isActive]
      );
    }

    console.log('[Seed] Inserting products...');
    for (const product of products) {
      await client.query(
        `INSERT INTO products (id, name, slug, brand_id, category_id, model_number, description, specifications, mrp, offer_price, images, is_featured, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          product.id,
          product.name,
          product.slug,
          product.brandId,
          product.categoryId,
          product.modelNumber,
          product.description,
          product.specifications,
          product.mrp,
          product.offerPrice,
          product.images,
          product.isFeatured,
          product.isActive,
          product.createdAt,
          product.updatedAt,
        ]
      );
    }

    console.log('[Seed] Inserting offers...');
    for (const offer of offers) {
      await client.query(
        `INSERT INTO offers (id, title, slug, type, description, image, discount_text, valid_until, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [offer.id, offer.title, offer.slug, offer.type, offer.description, offer.image, offer.discountText, offer.validUntil, offer.isActive, offer.sortOrder]
      );
    }

    await client.query('COMMIT');
    console.log('[Seed] Database seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
