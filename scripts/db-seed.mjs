import fs from 'fs';
import path from 'path';
import pg from 'pg';
import crypto from 'node:crypto';

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

// Mock Seed Data for Yash Electronics - Electronics & Power Solutions
const settings = {
  businessName: 'Yash Electronics',
  businessName_gu: 'યશ ઇલેક્ટ્રોનિક્સ',
  tagline: 'Your Trusted Power Solutions & DJ Sound Systems Partner',
  tagline_gu: 'તમારા વિશ્વાસનીય પાવર સોલ્યુશન્સ અને ડીજે સાઉન્ડ સિસ્ટમ્સ પાર્ટનર',
  phone: '+91 98244 17122',
  whatsapp: '919824417122',
  email: 'info@yashelectronics.in',
  address: 'Yash Electronics, 17, near S.B.I. (ADB), Jodhpur Gate, Navapara',
  address_gu: 'યશ ઇલેક્ટ્રોનિક્સ, ૧૭, એસ.બી.આઈ. (ADB) નજીક, જોધપુર ગેટ, નવાપરા',
  city: 'Khambhalia',
  city_gu: 'ખંભાળિયા',
  state: 'Gujarat',
  state_gu: 'ગુજરાત',
  pincode: '361305',
  googleMapsUrl: 'https://maps.google.com',
  heroTitle: 'Genuine Inverters, Batteries & Professional DJ Systems',
  heroTitle_gu: 'અસલી ઇન્વર્ટર, બેટરીઓ અને પ્રોફેશનલ ડીજે સિસ્ટમ્સ',
  heroSubtitle: 'Authorized dealer for Luminous, Microtek, Exide, Amaron, Livguard, JBL, Sony, Pioneer & more. Family-owned and service-oriented since 2000.',
  heroSubtitle_gu: 'લ્યુમિનસ, માઇક્રોટેક, એક્સાઇડ, અમરોન, લીવગાર્ડ, જેબીએલ, સોની, પાયોનિયર અને વધુ માટે અધિકૃત ડીલર. ૨૦૦૦ થી ગ્રાહક સેવાલક્ષી પારિવારિક વ્યવસાય.',
  heroImage: 'yash-electronics/general/hero',
  logoUrl: 'yash-electronics/general/logo',
  heroCtaText: 'Browse Catalog',
  heroCtaText_gu: 'બધી પ્રોડક્ટ્સ જુઓ',
  heroCtaLink: '/products',
  workingHours: 'Mon–Sat: 9:30 AM – 9:00 PM | Sun: Occasionally Open, 9:30 AM – 2:00 PM',
  workingHours_gu: 'સોમ–શનિ: ૯:૩૦ AM – ૯:૦૦ PM | રવિ: પ્રસંગોપાત ખુલ્લું, ૯:૩૦ AM – ૨:૦૦ PM',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  youtubeUrl: 'https://youtube.com',
  signup_bonus_points: '50',
  referrer_bonus_points: '100',
};

const categories = [
  { id: 'cat1', name: 'Home Inverters', nameGu: 'હોમ ઇન્વર્ટર', slug: 'home-inverters', description: 'High-performance home inverters and UPS for uninterrupted power supply.', descriptionGu: 'અવિરત પાવર સપ્લાય માટે ઉચ્ચ પ્રદર્શનવાળા હોમ ઇન્વર્ટર અને યુપીએસ.', icon: 'inverter', image: 'yash-electronics/categories/led-tv', sortOrder: 1, isActive: true },
  { id: 'cat2', name: 'Batteries', nameGu: 'બેટરીઓ', slug: 'batteries', description: 'Long-lasting tubular and flat plate batteries for inverters and vehicles.', descriptionGu: 'ઇન્વર્ટર અને વાહનો માટે લાંબો સમય ચાલતી ટ્યુબ્યુલર અને ફ્લેટ પ્લેટ બેટરી.', icon: 'battery', image: 'yash-electronics/categories/refrigerator', sortOrder: 2, isActive: true },
  { id: 'cat3', name: 'Sound Systems', nameGu: 'સાઉન્ડ સિસ્ટમ્સ', slug: 'sound-systems', description: 'Premium home theatres, soundbars, and consumer audio gear.', descriptionGu: 'પ્રીમિયમ હોમ થિયેટર્સ, સાઉન્ડબાર્સ અને કન્ઝ્યુમર ઓડિયો ગિયર.', icon: 'speaker', image: 'yash-electronics/categories/washing-machine', sortOrder: 3, isActive: true },
  { id: 'cat4', name: 'DJ Speaker Systems', nameGu: 'ડીજે સ્પીકર સિસ્ટમ્સ', slug: 'dj-speaker-systems', description: 'Professional DJ speakers, amplifiers, mixers, and stage audio gear.', descriptionGu: 'પ્રોફેશનલ ડીજે સ્પીકર્સ, એમ્પ્લીફાયર, મિક્સર્સ અને સ્ટેજ ઓડિયો ગિયર.', icon: 'dj', image: 'yash-electronics/categories/microwave', sortOrder: 4, isActive: true },
];

const brands = [
  { id: 'b1', name: 'Luminous', nameGu: 'લ્યુમિનસ', slug: 'luminous', logo: 'yash-electronics/brands/sony', sortOrder: 1, isActive: true },
  { id: 'b2', name: 'Microtek', nameGu: 'માઇક્રોટેક', slug: 'microtek', logo: 'yash-electronics/brands/samsung', sortOrder: 2, isActive: true },
  { id: 'b3', name: 'Exide', nameGu: 'એક્સાઇડ', slug: 'exide', logo: 'yash-electronics/brands/haier', sortOrder: 3, isActive: true },
  { id: 'b4', name: 'Amaron', nameGu: 'અમરોન', slug: 'amaron', logo: 'yash-electronics/brands/ifb', sortOrder: 4, isActive: true },
  { id: 'b5', name: 'Livguard', nameGu: 'લીવગાર્ડ', slug: 'livguard', logo: 'yash-electronics/brands/iwis', sortOrder: 5, isActive: true },
  { id: 'b6', name: 'JBL', nameGu: 'જેબીએલ', slug: 'jbl', logo: 'yash-electronics/brands/clt', sortOrder: 6, isActive: true },
  { id: 'b7', name: 'Sony', nameGu: 'સોની', slug: 'sony', logo: 'yash-electronics/brands/trion', sortOrder: 7, isActive: true },
  { id: 'b8', name: 'Pioneer', nameGu: 'પાયોનિયર', slug: 'pioneer', logo: 'yash-electronics/brands/komfy', sortOrder: 8, isActive: true },
  { id: 'b9', name: 'Studio Master', nameGu: 'સ્ટુડિયો માસ્ટર', slug: 'studio-master', logo: 'yash-electronics/brands/daikin', sortOrder: 9, isActive: true },
  { id: 'b10', name: 'Ahuja', nameGu: 'આહુજા', slug: 'ahuja', logo: 'yash-electronics/brands/voltas', sortOrder: 10, isActive: true },
];

const products = [
  {
    id: 'p1',
    name: 'Luminous Zelio+ 1100 Home UPS',
    slug: 'luminous-zelio-1100',
    brandId: 'b1',
    categoryId: 'cat1',
    modelNumber: 'Zelio+ 1100',
    description: 'India\'s most intelligent home UPS with LED display for backup and charging time status. Features pure sine wave output for protection of sensitive appliances.',
    specifications: '{"Capacity":"900 VA","Output Waveform":"Pure Sine Wave","Max Charging Current":"15 A","Battery Support":"12V Single Battery","Warranty":"2 Years"}',
    mrp: 8500,
    offerPrice: 6800,
    images: ['yash-electronics/products/sony-tv-1'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-15',
    updatedAt: '2026-06-01',
  },
  {
    id: 'p2',
    name: 'Microtek UPS SEBz 1100 Pure Sine Wave',
    slug: 'microtek-sebz-1100',
    brandId: 'b2',
    categoryId: 'cat1',
    modelNumber: 'SEBz 1100',
    description: 'Heavy duty inverter designed with micro-controller based intelligent technology. Delivers standard backup and stable voltage output.',
    specifications: '{"Capacity":"950 VA","Output Waveform":"Pure Sine Wave","Input Voltage Range":"100V - 300V","Warranty":"2 Years"}',
    mrp: 7800,
    offerPrice: 5990,
    images: ['yash-electronics/products/samsung-fridge-1'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-20',
    updatedAt: '2026-06-02',
  },
  {
    id: 'p3',
    name: 'Luminous Cruze+ 2KVA Heavy Duty Inverter',
    slug: 'luminous-cruze-2kva',
    brandId: 'b1',
    categoryId: 'cat1',
    modelNumber: 'Cruze+ 2KVA',
    description: 'High capacity inverter suitable for running high-load appliances like air conditioners, geysers, and refrigerators in homes or offices.',
    specifications: '{"Capacity":"2000 VA / 24V","Output Waveform":"Pure Sine Wave","Battery Support":"24V Double Battery","Warranty":"2 Years"}',
    mrp: 18500,
    offerPrice: 14900,
    images: ['yash-electronics/products/ifb-washer-1'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-25',
    updatedAt: '2026-06-03',
  },
  {
    id: 'p4',
    name: 'Exide Instabrite 150Ah Tall Tubular Battery',
    slug: 'exide-instabrite-150ah',
    brandId: 'b3',
    categoryId: 'cat2',
    modelNumber: 'IB1500',
    description: 'Low-maintenance tubular battery with hybrid alloy system. Highly reliable and customized for extreme Indian power cut conditions.',
    specifications: '{"Capacity":"150 Ah","Battery Type":"Tall Tubular","Voltage":"12 V","Warranty":"36 Months"}',
    mrp: 16500,
    offerPrice: 12500,
    images: ['yash-electronics/products/daikin-ac-1'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-10',
    updatedAt: '2026-06-05',
  },
  {
    id: 'p5',
    name: 'Amaron Current 150Ah Tall Tubular Battery',
    slug: 'amaron-current-150ah',
    brandId: 'b4',
    categoryId: 'cat2',
    modelNumber: 'CR150TT',
    description: 'High durability battery with ultra-low water loss. Made with high-heat-resistant calcium-silver alloy plates for long service life.',
    specifications: '{"Capacity":"150 Ah","Battery Type":"Tall Tubular","Voltage":"12 V","Warranty":"42 Months"}',
    mrp: 17200,
    offerPrice: 13200,
    images: ['yash-electronics/products/haier-microwave-1'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-15',
    updatedAt: '2026-06-05',
  },
  {
    id: 'p6',
    name: 'Livguard IT 1560TT 150Ah Battery',
    slug: 'livguard-150ah',
    brandId: 'b5',
    categoryId: 'cat2',
    modelNumber: 'IT 1560TT',
    description: 'Superb power backup with 3D grid design for faster charging and high durability. Best-in-class performance under low maintenance.',
    specifications: '{"Capacity":"150 Ah","Battery Type":"Tall Tubular","Voltage":"12 V","Warranty":"60 Months"}',
    mrp: 15800,
    offerPrice: 11990,
    images: ['yash-electronics/products/voltas-cooler-1'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-18',
    updatedAt: '2026-06-06',
  },
  {
    id: 'p7',
    name: 'Sony HT-S20R 5.1ch Real Surround Soundbar',
    slug: 'sony-ht-s20r-5-1ch',
    brandId: 'b7',
    categoryId: 'cat3',
    modelNumber: 'HT-S20R',
    description: 'Get real 5.1 channel surround sound with rear speakers and external subwoofer. Connect via Bluetooth or USB for instant music playback.',
    specifications: '{"Total Power":"400 W","Audio Channels":"5.1 ch","Subwoofer Type":"Wired","Connectivity":"Bluetooth, HDMI ARC, Optical, USB","Warranty":"1 Year"}',
    mrp: 19990,
    offerPrice: 16990,
    images: ['yash-electronics/products/blue-star-ac-1'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-22',
    updatedAt: '2026-06-07',
  },
  {
    id: 'p8',
    name: 'JBL Bar 500 Pro 5.1ch Soundbar',
    slug: 'jbl-bar-500-pro',
    brandId: 'b6',
    categoryId: 'cat3',
    modelNumber: 'BAR 500',
    description: 'Bring movies and games to life with 590W of total output power and Dolby Atmos. Enjoy thrashing bass from the 10-inch wireless subwoofer.',
    specifications: '{"Total Power":"590 W","Audio Channels":"5.1 ch","Subwoofer Type":"Wireless 10-inch","Features":"Dolby Atmos, MultiBeam, Chromecast Built-in","Warranty":"1 Year"}',
    mrp: 54999,
    offerPrice: 44999,
    images: ['yash-electronics/products/samsung-microwave-1'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-28',
    updatedAt: '2026-06-08',
  },
  {
    id: 'p9',
    name: 'JBL Professional EON715 15-inch Powered DJ Speaker',
    slug: 'jbl-eon715-powered-speaker',
    brandId: 'b6',
    categoryId: 'cat4',
    modelNumber: 'EON715',
    description: 'High-performance PA speaker with built-in dbx DriveRack DSP, Bluetooth control, and rugged composite enclosure. Perfect for DJs, weddings, and live events.',
    specifications: '{"Power Rating":"1300 W Peak / 650 W RMS","Woofer Size":"15 inch","Frequency Response":"45 Hz - 20 kHz","Max SPL":"128 dB","Warranty":"3 Years"}',
    mrp: 62000,
    offerPrice: 51900,
    images: ['yash-electronics/products/sony-tv-2'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-06-01',
    updatedAt: '2026-06-09',
  },
  {
    id: 'p10',
    name: 'Studio Master Fire 55 Dual 15-inch DJ Cabinet Speaker',
    slug: 'studiomaster-fire-55',
    brandId: 'b9',
    categoryId: 'cat4',
    modelNumber: 'Fire 55',
    description: 'High performance dual 15-inch passive speaker system designed for touring DJ applications and medium-to-large venue sound reinforcement.',
    specifications: '{"Power Rating":"1200 W RMS / 2400 W Peak","Configuration":"Dual 15-inch Passive","Impedance":"4 Ohms","Max SPL":"134 dB","Warranty":"1 Year"}',
    mrp: 48000,
    offerPrice: 39900,
    images: ['yash-electronics/products/sony-tv-1'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-02',
    updatedAt: '2026-06-10',
  },
  {
    id: 'p11',
    name: 'Pioneer DJ DDJ-FLX4 2-Channel DJ Controller',
    slug: 'pioneer-dj-ddj-flx4',
    brandId: 'b8',
    categoryId: 'cat4',
    modelNumber: 'DDJ-FLX4',
    description: 'Professional layout 2-channel DJ controller compatible with rekordbox and Serato DJ Lite. Features Smart Fader and Smart CFX for easy mixing.',
    specifications: '{"Channels":"2","Deck Control":"2","Software":"rekordbox, Serato DJ Lite","Inputs":"1 Mic (1/4 inch)","Outputs":"1 Master (RCA), 1 Phones","Warranty":"1 Year"}',
    mrp: 34990,
    offerPrice: 29990,
    images: ['yash-electronics/products/samsung-fridge-1'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-06-03',
    updatedAt: '2026-06-11',
  },
  {
    id: 'p12',
    name: 'Ahuja SSA-250M PA Amplifier with USB/BT',
    slug: 'ahuja-ssa-250m-amplifier',
    brandId: 'b10',
    categoryId: 'cat4',
    modelNumber: 'SSA-250M',
    description: 'India\'s most popular PA mixer amplifier with built-in digital player and Bluetooth. Delivers clear, loud sound for speech and music applications.',
    specifications: '{"Power Output":"300W Max / 250W RMS","Inputs":"6 Mic, 2 Aux","Speaker Outputs":"4, 8, 70V, 100V","Features":"Built-in MP3 Player, USB, SD, Bluetooth, Remote","Warranty":"1 Year"}',
    mrp: 24500,
    offerPrice: 19900,
    images: ['yash-electronics/products/ifb-washer-1'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-04',
    updatedAt: '2026-06-12',
  }
];

const offers = [
  {
    id: 'o1',
    title: 'Inverter + Battery Combo Offer',
    slug: 'inverter-battery-combo',
    type: 'combo',
    description: 'Buy Luminous Zelio+ Inverter with Exide 150Ah Tubular Battery and get additional discount + free installation.',
    image: 'yash-electronics/offers/combo-tv',
    discountText: 'Save up to ₹3,000',
    validUntil: '2026-07-31',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'o2',
    title: 'Professional DJ Stage Pack',
    slug: 'dj-stage-pack-offer',
    type: 'bundle',
    description: 'Get two JBL EON715 Powered Speakers, Studio Master Mixer, and mic stands at a bundle price.',
    image: 'yash-electronics/offers/kitchen-bundle',
    discountText: 'Bundle & Save 12%',
    validUntil: '2026-08-31',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'o3',
    title: 'Battery Exchange Mela',
    slug: 'battery-exchange-mela',
    type: 'weekly',
    description: 'Bring your old scrap battery of any brand and get flat ₹2,000 to ₹3,500 off on a new Exide or Amaron battery.',
    image: 'yash-electronics/offers/ac-weekly',
    discountText: 'Up to ₹3,500 Off on Exchange',
    validUntil: '2026-06-30',
    isActive: true,
    sortOrder: 3,
  },
];

const teamMembersData = [
  {
    id: 'tm1',
    name: 'Mr. Paresh Mehta',
    photo: null,
    phone: '+91 98244 17122',
    role: 'sales_head',
    department: 'sales',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'tm2',
    name: 'Hardik Kanajariya',
    photo: null,
    phone: '+91 98244 17123',
    role: 'sales_staff',
    department: 'sales',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'tm3',
    name: 'Sanjay Bhai',
    photo: null,
    phone: '+91 98244 17124',
    role: 'service_head',
    department: 'service',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'tm4',
    name: 'Ramesh Patel',
    photo: null,
    phone: '+91 98244 17125',
    role: 'service_staff',
    department: 'service',
    sortOrder: 2,
    isActive: true,
  },
];

const servicesData = [
  {
    id: 's1',
    title: 'Inverter Installation & Setup',
    slug: 'inverter-installation',
    description: 'Professional installation of home inverters, UPS systems, and battery setups with neat wiring, protective casing, and overload calculations.',
    icon: 'tool',
    image: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 's2',
    title: 'Battery Health Check & Acid Topping',
    slug: 'battery-health-check',
    description: 'Periodic maintenance, distilled water topping, specific gravity checking of acid, and load testing to extend your battery life.',
    icon: 'shield',
    image: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 's3',
    title: 'Acoustic Sound System Setup',
    slug: 'acoustic-sound-setup',
    description: 'Perfect audio calibration, speaker positioning, and cabling setup for home theatres, TV soundbars, banquet halls, and commercial places.',
    icon: 'badge',
    image: null,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 's4',
    title: 'DJ & PA System Service & Rental Support',
    slug: 'dj-system-service',
    description: 'On-site technical support, driver replacements, amplifier tuning, and maintenance of professional speaker setups and stage monitors.',
    icon: 'location',
    image: null,
    sortOrder: 4,
    isActive: true,
  },
];

const aboutInfoData = [
  {
    id: 'ab1',
    role: 'founder',
    name: 'Mr. Yash Mehta',
    photo: null,
    description: 'Founded Yash Electronics in 2000 with a commitment to bring reliable power backup solutions and high-quality entertainment sound systems to Khambhalia and nearby regions.',
    sortOrder: 1,
  },
  {
    id: 'ab2',
    role: 'owner',
    name: 'Mr. Paresh Mehta',
    photo: null,
    description: 'Over 20 years of hands-on technical expertise in electronics repair, battery maintenance, and professional sound systems. Believes in providing prompt, family-like post-sales service.',
    sortOrder: 2,
  },
  {
    id: 'ab3',
    role: 'next_gen',
    name: 'Hardik Mehta',
    photo: null,
    description: 'Expanding the business into digital operations, advanced home automation, solar inverter integrations, and custom acoustic setups for next-generation clients.',
    sortOrder: 3,
  },
];

const bankDetailsData = [
  {
    id: 'bk1',
    bankName: 'State Bank of India',
    accountHolderName: 'YASH ELECTRONICS',
    accountNumber: '32145678901',
    ifscCode: 'SBIN0000312',
    branchName: 'Khambhalia ADB Branch',
    upiQrCode: null,
    bankQrCode: null,
    isActive: true,
  },
];

const businessHoursData = [
  { id: 'bh0', dayOfWeek: 0, label: 'Sunday', openTime: '09:30', closeTime: '14:00', isOpen: true, note: 'Occasionally Open' },
  { id: 'bh1', dayOfWeek: 1, label: 'Monday', openTime: '09:30', closeTime: '21:00', isOpen: true, note: null },
  { id: 'bh2', dayOfWeek: 2, label: 'Tuesday', openTime: '09:30', closeTime: '21:00', isOpen: true, note: null },
  { id: 'bh3', dayOfWeek: 3, label: 'Wednesday', openTime: '09:30', closeTime: '21:00', isOpen: true, note: null },
  { id: 'bh4', dayOfWeek: 4, label: 'Thursday', openTime: '09:30', closeTime: '21:00', isOpen: true, note: null },
  { id: 'bh5', dayOfWeek: 5, label: 'Friday', openTime: '09:30', closeTime: '21:00', isOpen: true, note: null },
  { id: 'bh6', dayOfWeek: 6, label: 'Saturday', openTime: '09:30', closeTime: '21:00', isOpen: true, note: null },
];

async function seed() {
  console.log('[Seed] Connecting to database...');
  await client.connect();

  try {
    // Begin Transaction
    await client.query('BEGIN');

    console.log('[Seed] Clearing existing data...');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM referral_history');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM contact_queries');
    await client.query('DELETE FROM settings');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM brands');
    await client.query('DELETE FROM offers');
    await client.query('DELETE FROM team_members');
    await client.query('DELETE FROM services');
    await client.query('DELETE FROM about_info');
    await client.query('DELETE FROM bank_details');
    await client.query('DELETE FROM business_hours');

    console.log('[Seed] Inserting admin user (Mr. Paresh Mehta)...');
    await client.query(
      `INSERT INTO users (id, name, phone, password, role, referral_code, credits, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'admin-id',
        'Mr. Paresh Mehta',
        '9824417122',
        '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin' hashed
        'admin',
        'ADMIN',
        0,
        new Date().toISOString(),
      ]
    );

    // Create a regular user who has referred another user for history testing
    console.log('[Seed] Inserting sample customer user (Rajesh Kumar)...');
    await client.query(
      `INSERT INTO users (id, name, phone, password, role, referral_code, referred_by_id, credits, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'user-rajesh',
        'Rajesh Kumar',
        '9876543210',
        'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', // 'password' hashed
        'customer',
        'RAJESH50',
        null,
        150,
        new Date().toISOString(),
      ]
    );

    console.log('[Seed] Inserting sample referred user (Vijay Patel)...');
    await client.query(
      `INSERT INTO users (id, name, phone, password, role, referral_code, referred_by_id, credits, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'user-vijay',
        'Vijay Patel',
        '9876543211',
        'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f',
        'customer',
        'VIJAY22',
        'user-rajesh',
        50,
        new Date().toISOString(),
      ]
    );

    console.log('[Seed] Inserting sample referral history...');
    await client.query(
      `INSERT INTO referral_history (id, referrer_id, referred_user_id, points_earned, type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'ref-h1',
        'user-rajesh',
        'user-vijay',
        100,
        'referrer_bonus',
        new Date().toISOString(),
      ]
    );

    await client.query(
      `INSERT INTO referral_history (id, referrer_id, referred_user_id, points_earned, type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'ref-h2',
        'user-rajesh',
        'user-vijay',
        50,
        'signup_bonus',
        new Date().toISOString(),
      ]
    );

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
        `INSERT INTO categories (id, name, name_gu, slug, description, description_gu, icon, image, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          category.id,
          category.name,
          category.nameGu || null,
          category.slug,
          category.description || null,
          category.descriptionGu || null,
          category.icon,
          category.image,
          category.sortOrder,
          category.isActive
        ]
      );
    }

    console.log('[Seed] Inserting brands...');
    for (const brand of brands) {
      await client.query(
        `INSERT INTO brands (id, name, name_gu, slug, logo, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          brand.id,
          brand.name,
          brand.nameGu || null,
          brand.slug,
          brand.logo,
          brand.sortOrder,
          brand.isActive
        ]
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

    console.log('[Seed] Inserting team members...');
    for (const tm of teamMembersData) {
      await client.query(
        `INSERT INTO team_members (id, name, photo, phone, role, department, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [tm.id, tm.name, tm.photo, tm.phone, tm.role, tm.department, tm.sortOrder, tm.isActive]
      );
    }

    console.log('[Seed] Inserting services...');
    for (const s of servicesData) {
      await client.query(
        `INSERT INTO services (id, title, slug, description, icon, image, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [s.id, s.title, s.slug, s.description, s.icon, s.image, s.sortOrder, s.isActive]
      );
    }

    console.log('[Seed] Inserting about info...');
    for (const ab of aboutInfoData) {
      await client.query(
        `INSERT INTO about_info (id, role, name, photo, description, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [ab.id, ab.role, ab.name, ab.photo, ab.description, ab.sortOrder]
      );
    }

    console.log('[Seed] Inserting bank details...');
    for (const bk of bankDetailsData) {
      await client.query(
        `INSERT INTO bank_details (id, bank_name, account_holder_name, account_number, ifsc_code, branch_name, upi_qr_code, bank_qr_code, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [bk.id, bk.bankName, bk.accountHolderName, bk.accountNumber, bk.ifscCode, bk.branchName, bk.upiQrCode, bk.bankQrCode, bk.isActive]
      );
    }

    console.log('[Seed] Inserting business hours...');
    for (const bh of businessHoursData) {
      await client.query(
        `INSERT INTO business_hours (id, day_of_week, label, open_time, close_time, is_open, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [bh.id, bh.dayOfWeek, bh.label, bh.openTime, bh.closeTime, bh.isOpen, bh.note]
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
