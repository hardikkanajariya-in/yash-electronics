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
const hasDisableSSL = connectionString.includes('sslmode=disable');
const client = new pg.Client({
  connectionString,
  ssl: (isLocal || hasDisableSSL) ? false : { rejectUnauthorized: false },
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
  heroImage: '/images/seed/hero.jpg',
  logoUrl: '/icon-512.png',
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
  { id: 'cat1', name: 'Home Inverters', nameGu: 'હોમ ઇન્વર્ટર', slug: 'home-inverters', description: 'High-performance home inverters and UPS for uninterrupted power supply.', descriptionGu: 'અવિરત પાવર સપ્લાય માટે ઉચ્ચ પ્રદર્શનવાળા હોમ ઇન્વર્ટર અને યુપીએસ.', icon: 'inverter', image: '/images/seed/categories/home-inverters.png', sortOrder: 1, isActive: true },
  { id: 'cat2', name: 'Batteries', nameGu: 'બેટરીઓ', slug: 'batteries', description: 'Long-lasting tubular and flat plate batteries for inverters and vehicles.', descriptionGu: 'ઇન્વર્ટર અને વાહનો માટે લાંબો સમય ચાલતી ટ્યુબ્યુલર અને ફ્લેટ પ્લેટ બેટરી.', icon: 'battery', image: '/images/seed/categories/batteries.png', sortOrder: 2, isActive: true },
  { id: 'cat3', name: 'Sound Systems', nameGu: 'સાઉન્ડ સિસ્ટમ્સ', slug: 'sound-systems', description: 'Premium home theatres, soundbars, and consumer audio gear.', descriptionGu: 'પ્રીમિયમ હોમ થિયેટર્સ, સાઉન્ડબાર્સ અને કન્ઝ્યુમર ઓડિયો ગિયર.', icon: 'speaker', image: '/images/seed/categories/sound-systems.png', sortOrder: 3, isActive: true },
  { id: 'cat4', name: 'DJ Speaker Systems', nameGu: 'ડીજે સ્પીકર સિસ્ટમ્સ', slug: 'dj-speaker-systems', description: 'Professional DJ speakers, amplifiers, mixers, and stage audio gear.', descriptionGu: 'પ્રોફેશનલ ડીજે સ્પીકર્સ, એમ્પ્લીફાયર, મિક્સર્સ અને સ્ટેજ ઓડિયો ગિયર.', icon: 'dj', image: '/images/seed/categories/dj-speaker-systems.png', sortOrder: 4, isActive: true },
  { id: 'cat5', name: 'Air Conditioner', nameGu: 'એર કંડિશનર', slug: 'air-conditioners', description: 'Premium split and window air conditioners for optimal cooling.', descriptionGu: 'શ્રેષ્ઠ ઠંડક માટે પ્રીમિયમ સ્પ્લિટ અને વિન્ડો એર કંડિશનર્સ.', icon: 'ac', image: '/images/seed/categories/air-conditioner.jpg', sortOrder: 5, isActive: true },
  { id: 'cat6', name: 'Air Cooler', nameGu: 'એર કૂલર', slug: 'air-coolers', description: 'Powerful desert and personal air coolers for efficient summer cooling.', descriptionGu: 'ઉનાળાની અસરકારક ઠંડક માટે શક્તિશાળી ડેઝર્ટ અને પર્સનલ એર કૂલર્સ.', icon: 'cooler', image: '/images/seed/categories/air-cooler.jpg', sortOrder: 6, isActive: true },
  { id: 'cat7', name: 'Air Fryer', nameGu: 'એર ફ્રાયર', slug: 'air-fryers', description: 'Healthy oil-free air fryers for modern cooking.', descriptionGu: 'આધુનિક રસોઈ માટે હેલ્ધી ઓઈલ-ફ્રી એર ફ્રાયર્સ.', icon: 'fryer', image: '/images/seed/categories/air-fryer.jpg', sortOrder: 7, isActive: true },
  { id: 'cat8', name: 'Blender', nameGu: 'બ્લેન્ડર', slug: 'blenders', description: 'High-speed hand and bottle blenders for smoothies and purees.', descriptionGu: 'સ્મૂધી અને પ્યુરી માટે હાઇ-સ્પીડ હેન્ડ અને બોટલ બ્લેન્ડર.', icon: 'blender', image: '/images/seed/categories/blender.jpg', sortOrder: 8, isActive: true },
  { id: 'cat9', name: 'Chimney', nameGu: 'ચીમની', slug: 'chimneys', description: 'Auto-clean kitchen chimneys for a smoke-free cooking experience.', descriptionGu: 'ધૂમ્રપાન રહિત રસોઈના અનુભવ માટે ઓટો-ક્લીન કિચન ચીમની.', icon: 'chimney', image: '/images/seed/categories/chimney.jpg', sortOrder: 9, isActive: true },
  { id: 'cat10', name: 'Gas Stove', nameGu: 'ગેસ સ્ટવ', slug: 'gas-stoves', description: 'Premium glass top 3 and 4 burner gas stoves.', descriptionGu: 'પ્રીમિયમ ગ્લાસ ટોપ ૩ અને ૪ બર્નર ગેસ સ્ટવ.', icon: 'stove', image: '/images/seed/categories/gas-stove.jpg', sortOrder: 10, isActive: true },
  { id: 'cat11', name: 'Gharghanti', nameGu: 'ઘરઘંટી', slug: 'gharghanti', description: 'Domestic flour mills for fresh and hygienic home-ground flour.', descriptionGu: 'તાજા અને આરોગ્યપ્રદ હોમ-ગ્રાઉન્ડ લોટ માટે ઘરેલું લોટ મિલો.', icon: 'mill', image: '/images/seed/categories/gharghanti.jpg', sortOrder: 11, isActive: true },
  { id: 'cat12', name: 'LED TV', nameGu: 'એલઇડી ટીવી', slug: 'led-tvs', description: 'Smart 4K Ultra HD LED televisions for immersive home entertainment.', descriptionGu: 'ઇમર્સિવ હોમ એન્ટરટેઇનમેન્ટ માટે સ્માર્ટ 4K અલ્ટ્રા એચડી એલઇડી ટેલિવિઝન.', icon: 'tv', image: '/images/seed/categories/led-tv.jpg', sortOrder: 12, isActive: true },
  { id: 'cat13', name: 'Microwave', nameGu: 'માઇક્રોવેવ', slug: 'microwaves', description: 'Solo, grill, and convection microwave ovens for versatile cooking.', descriptionGu: 'બહુમુખી રસોઈ માટે સોલો, ગ્રીલ અને કન્વેક્શન માઇક્રોવેવ ઓવન.', icon: 'microwave', image: '/images/seed/categories/microwave.jpg', sortOrder: 13, isActive: true },
  { id: 'cat14', name: 'Mixer Grinder', nameGu: 'મિક્સર ગ્રાઇન્ડર', slug: 'mixer-grinders', description: 'Heavy-duty mixer grinders for grinding chutneys and spices.', descriptionGu: 'ચટણી અને મસાલા પીસવા માટે હેવી-ડ્યુટી મિક્સર ગ્રાઇન્ડર.', icon: 'grinder', image: '/images/seed/categories/mixer-grinder.jpg', sortOrder: 14, isActive: true },
  { id: 'cat15', name: 'Refrigerator', nameGu: 'રેફ્રિજરેટર', slug: 'refrigerators', description: 'Energy-efficient single door and double door refrigerators.', descriptionGu: 'ઊર્જા-કાર્યક્ષમ સિંગલ ડોર અને ડબલ ડોર રેફ્રિજરેટર્સ.', icon: 'fridge', image: '/images/seed/categories/refrigerator.jpg', sortOrder: 15, isActive: true },
  { id: 'cat16', name: 'RO System', nameGu: 'આરઓ સિસ્ટમ', slug: 'ro-systems', description: 'Advanced RO water purifiers with copper and alkaline minerals.', descriptionGu: 'કોપર અને આલ્કલાઇન મિનરલ્સ સાથે એડવાન્સ્ડ આરઓ વોટર પ્યુરિફાયર.', icon: 'ro', image: '/images/seed/categories/ro-system.jpg', sortOrder: 16, isActive: true },
  { id: 'cat17', name: 'Washing Machine', nameGu: 'વોશિંગ મશીન', slug: 'washing-machines', description: 'Fully automatic front load and top load washing machines.', descriptionGu: 'સંપૂર્ણ ઓટોમેટિક ફ્રન્ટ લોડ અને ટોપ લોડ વોશિંગ મશીન.', icon: 'washer', image: '/images/seed/categories/washing-machine.jpg', sortOrder: 17, isActive: true },
];

const brands = [
  { id: 'b1', name: 'Luminous', nameGu: 'લ્યુમિનસ', slug: 'luminous', logo: '/images/seed/brands/luminous.svg', sortOrder: 1, isActive: true },
  { id: 'b2', name: 'Microtek', nameGu: 'માઇક્રોટેક', slug: 'microtek', logo: '/images/seed/brands/microtek.svg', sortOrder: 2, isActive: true },
  { id: 'b3', name: 'Exide', nameGu: 'એક્સાઇડ', slug: 'exide', logo: '/images/seed/brands/exide.svg', sortOrder: 3, isActive: true },
  { id: 'b4', name: 'Amaron', nameGu: 'અમરોન', slug: 'amaron', logo: '/images/seed/brands/amaron.svg', sortOrder: 4, isActive: true },
  { id: 'b5', name: 'Livguard', nameGu: 'લીવગાર્ડ', slug: 'livguard', logo: '/images/seed/brands/livguard.svg', sortOrder: 5, isActive: true },
  { id: 'b6', name: 'JBL', nameGu: 'જેબીએલ', slug: 'jbl', logo: '/images/seed/brands/jbl.svg', sortOrder: 6, isActive: true },
  { id: 'b7', name: 'Sony', nameGu: 'સોની', slug: 'sony', logo: '/images/seed/brands/sony.svg', sortOrder: 7, isActive: true },
  { id: 'b8', name: 'Pioneer', nameGu: 'પાયોનિયર', slug: 'pioneer', logo: '/images/seed/brands/pioneer.svg', sortOrder: 8, isActive: true },
  { id: 'b9', name: 'Studio Master', nameGu: 'સ્ટુડિયો માસ્ટર', slug: 'studio-master', logo: '/images/seed/brands/studio-master.svg', sortOrder: 9, isActive: true },
  { id: 'b10', name: 'Ahuja', nameGu: 'આહુજા', slug: 'ahuja', logo: '/images/seed/brands/ahuja.svg', sortOrder: 10, isActive: true },
  { id: 'b11', name: 'Blue Star', nameGu: 'બ્લુ સ્ટાર', slug: 'blue-star', logo: '/images/seed/brands/blue-star.svg', sortOrder: 11, isActive: true },
  { id: 'b12', name: 'Daikin', nameGu: 'ડાયકિન', slug: 'daikin', logo: '/images/seed/brands/daikin.svg', sortOrder: 12, isActive: true },
  { id: 'b13', name: 'Haier', nameGu: 'હાયર', slug: 'haier', logo: '/images/seed/brands/haier.svg', sortOrder: 13, isActive: true },
  { id: 'b14', name: 'IFB', nameGu: 'આઈએફબી', slug: 'ifb', logo: '/images/seed/brands/ifb.svg', sortOrder: 14, isActive: true },
  { id: 'b15', name: 'Samsung', nameGu: 'સેમસંગ', slug: 'samsung', logo: '/images/seed/brands/samsung.svg', sortOrder: 15, isActive: true },
  { id: 'b16', name: 'Voltas', nameGu: 'વોલ્ટાસ', slug: 'voltas', logo: '/images/seed/brands/voltas.svg', sortOrder: 16, isActive: true },
  { id: 'b17', name: 'Natraj', nameGu: 'નટરાજ', slug: 'natraj', logo: '/images/seed/brands/natraj.svg', sortOrder: 17, isActive: true },
  { id: 'b18', name: 'LG', nameGu: 'એલજી', slug: 'lg', logo: '/images/seed/brands/lg.svg', sortOrder: 18, isActive: true },
  { id: 'b19', name: 'Philips', nameGu: 'ફિલિપ્સ', slug: 'philips', logo: '/images/seed/brands/philips.svg', sortOrder: 19, isActive: true },
  { id: 'b20', name: 'Faber', nameGu: 'ફેબર', slug: 'faber', logo: '/images/seed/brands/faber.svg', sortOrder: 20, isActive: true },
  { id: 'b21', name: 'Elica', nameGu: 'એલિકા', slug: 'elica', logo: '/images/seed/brands/elica.svg', sortOrder: 21, isActive: true },
  { id: 'b22', name: 'Prestige', nameGu: 'પ્રેસ્ટિજ', slug: 'prestige', logo: '/images/seed/brands/prestige.svg', sortOrder: 22, isActive: true },
  { id: 'b23', name: 'Sunflame', nameGu: 'સનફ્લેમ', slug: 'sunflame', logo: '/images/seed/brands/sunflame.svg', sortOrder: 23, isActive: true },
  { id: 'b24', name: 'Milcent', nameGu: 'મિલ્સેન્ટ', slug: 'milcent', logo: '/images/seed/brands/milcent.svg', sortOrder: 24, isActive: true },
  { id: 'b25', name: 'Sujata', nameGu: 'સુજાતા', slug: 'sujata', logo: '/images/seed/brands/sujata.svg', sortOrder: 25, isActive: true },
  { id: 'b26', name: 'Kent', nameGu: 'કેન્ટ', slug: 'kent', logo: '/images/seed/brands/kent.svg', sortOrder: 26, isActive: true },
  { id: 'b27', name: 'Aquaguard', nameGu: 'એક્વાગાર્ડ', slug: 'aquaguard', logo: '/images/seed/brands/aquaguard.svg', sortOrder: 27, isActive: true },
  { id: 'b28', name: 'Symphony', nameGu: 'સિમ્ફની', slug: 'symphony', logo: '/images/seed/brands/symphony.svg', sortOrder: 28, isActive: true },
];

const products = [
  // Home Inverters (cat1)
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
    images: ['/images/seed/products/luminous-zelio-1100.png'],
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
    images: ['/images/seed/products/microtek-sebz-1100.png'],
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
    images: ['/images/seed/products/luminous-cruze-2kva.png'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-25',
    updatedAt: '2026-06-03',
  },
  // Batteries (cat2)
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
    images: ['/images/seed/products/exide-instabrite-150ah.png'],
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
    images: ['/images/seed/products/amaron-current-150ah.png'],
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
    images: ['/images/seed/products/livguard-150ah.png'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-18',
    updatedAt: '2026-06-06',
  },
  // Sound Systems (cat3)
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
    images: ['/images/seed/products/sony-ht-s20r-5-1ch.png'],
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
    images: ['/images/seed/products/jbl-bar-500-pro.png'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-28',
    updatedAt: '2026-06-08',
  },
  // DJ Speaker Systems (cat4)
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
    images: ['/images/seed/products/jbl-eon715-powered-speaker.png'],
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
    images: ['/images/seed/products/studiomaster-fire-55.png'],
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
    images: ['/images/seed/products/pioneer-dj-ddj-flx4.png'],
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
    images: ['/images/seed/products/ahuja-ssa-250m-amplifier.png'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-04',
    updatedAt: '2026-06-12',
  },
  // Air Conditioners (cat5)
  {
    id: 'p13',
    name: 'Blue Star 1.5 Ton 3 Star Inverter AC',
    slug: 'blue-star-1-5-ac',
    brandId: 'b11',
    categoryId: 'cat5',
    modelNumber: 'IA318YLU',
    description: 'Highly energy-efficient split AC with variable speed compressor which adjusts power depending on heat load.',
    specifications: '{"Capacity":"1.5 Ton","Energy Rating":"3 Star","Type":"Split Inverter AC","Warranty":"1 Year on Product, 10 Years on Compressor"}',
    mrp: 45000,
    offerPrice: 35990,
    images: ['/images/seed/products/blue-star-ac-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-10',
    updatedAt: '2026-06-01',
  },
  {
    id: 'p14',
    name: 'Daikin 1.5 Ton 5 Star Inverter AC',
    slug: 'daikin-1-5-ac',
    brandId: 'b12',
    categoryId: 'cat5',
    modelNumber: 'MTKL50U',
    description: 'Econo mode enables efficient operation by limiting the maximum power consumption. Ideal for long hours of running.',
    specifications: '{"Capacity":"1.5 Ton","Energy Rating":"5 Star","Type":"Split Inverter AC","Warranty":"1 Year on Product, 5 Years on PCB, 10 Years on Compressor"}',
    mrp: 52000,
    offerPrice: 42990,
    images: ['/images/seed/products/daikin-ac-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-12',
    updatedAt: '2026-06-02',
  },
  // Air Coolers (cat6)
  {
    id: 'p15',
    name: 'Voltas JetMax 70 Litre Desert Air Cooler',
    slug: 'voltas-jetmax-70',
    brandId: 'b16',
    categoryId: 'cat6',
    modelNumber: 'JetMax 70',
    description: 'Powerful air throw with sleek premium design and eco-cool honeycomb pads for superior water absorption and chilling performance.',
    specifications: '{"Capacity":"70 Litres","Air Throw":"45 Ft","Honeycomb Pads":"Yes","Warranty":"1 Year"}',
    mrp: 14500,
    offerPrice: 11200,
    images: ['/images/seed/products/voltas-cooler-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-15',
    updatedAt: '2026-06-03',
  },
  {
    id: 'p16',
    name: 'Symphony Sumo 75 XL Desert Air Cooler',
    slug: 'symphony-sumo-75',
    brandId: 'b28',
    categoryId: 'cat6',
    modelNumber: 'Sumo 75 XL',
    description: 'Specially designed high efficiency cooling pads for rapid cooling, whisper-quiet operation, and lower energy consumption.',
    specifications: '{"Capacity":"75 Litres","Air Throw":"40 Ft","Blower/Fan":"Fan","Warranty":"1 Year"}',
    mrp: 15800,
    offerPrice: 12500,
    images: ['/images/seed/products/symphony-cooler.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-18',
    updatedAt: '2026-06-04',
  },
  // Air Fryers (cat7)
  {
    id: 'p17',
    name: 'Philips Daily Collection Air Fryer',
    slug: 'philips-daily-air-fryer',
    brandId: 'b19',
    categoryId: 'cat7',
    modelNumber: 'HD9200',
    description: 'Great tasting fries with up to 90% less fat. Rapid Air technology wraps food with warm circulating air for a crispy finish.',
    specifications: '{"Capacity":"4.1 Litres","Power":"1400 W","Technology":"Rapid Air","Warranty":"2 Years"}',
    mrp: 9990,
    offerPrice: 7990,
    images: ['/images/seed/products/philips-air-fryer.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-20',
    updatedAt: '2026-06-05',
  },
  {
    id: 'p18',
    name: 'Prestige PAF 3.0 Air Fryer',
    slug: 'prestige-paf-fryer',
    brandId: 'b22',
    categoryId: 'cat7',
    modelNumber: 'PAF 3.0',
    description: 'Prepare delicious fried snacks, roasted meats, and grilled vegetables without compromising on health or taste.',
    specifications: '{"Capacity":"3.2 Litres","Power":"1200 W","Temperature Control":"80-200 C","Warranty":"1 Year"}',
    mrp: 7500,
    offerPrice: 5990,
    images: ['/images/seed/products/prestige-air-fryer.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-22',
    updatedAt: '2026-06-06',
  },
  // Blenders (cat8)
  {
    id: 'p19',
    name: 'Nutribullet Pro 900W Blender',
    slug: 'nutribullet-pro-900',
    brandId: 'b19',
    categoryId: 'cat8',
    modelNumber: 'NB9-0912',
    description: 'Compact high-speed blender with extract blades to break down whole fruits and veggies into nutritious smoothies.',
    specifications: '{"Power":"900 W","Speed":"25000 RPM","Cups Included":"2","Warranty":"2 Years"}',
    mrp: 8990,
    offerPrice: 6990,
    images: ['/images/seed/products/nutribullet-blender.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-24',
    updatedAt: '2026-06-07',
  },
  {
    id: 'p20',
    name: 'Kent Hand Blender 300W',
    slug: 'kent-hand-blender',
    brandId: 'b26',
    categoryId: 'cat8',
    modelNumber: 'HB-300',
    description: 'Stainless steel blades with low noise operation, ideal for blending, whipping, churning, and pureeing soups or shakes.',
    specifications: '{"Power":"300 W","Speed Control":"Variable","Material":"Stainless Steel Stem","Warranty":"1 Year"}',
    mrp: 2200,
    offerPrice: 1750,
    images: ['/images/seed/products/kent-hand-blender.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-26',
    updatedAt: '2026-06-08',
  },
  // Chimneys (cat9)
  {
    id: 'p21',
    name: 'Faber 60cm 1000 m3/hr Chimney',
    slug: 'faber-60cm-chimney',
    brandId: 'b20',
    categoryId: 'cat9',
    modelNumber: 'Faber 60',
    description: 'Classic wall-mounted kitchen chimney with baffle filter and push buttons, designed for modern Indian kitchens.',
    specifications: '{"Suction Capacity":"1000 m3/hr","Filter Type":"Baffle Filter","Width":"60 cm","Warranty":"1 Year on Product, 5 Years on Motor"}',
    mrp: 12990,
    offerPrice: 9490,
    images: ['/images/seed/products/faber-chimney.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-28',
    updatedAt: '2026-06-09',
  },
  {
    id: 'p22',
    name: 'Elica 60cm 1100 m3/hr Chimney',
    slug: 'elica-60cm-chimney',
    brandId: 'b21',
    categoryId: 'cat9',
    modelNumber: 'Elica 60',
    description: 'Auto-clean filterless chimney featuring motion sensing technology for ease of control while cooking.',
    specifications: '{"Suction Capacity":"1100 m3/hr","Type":"Filterless Auto-Clean","Control":"Touch + Motion Sensor","Warranty":"1 Year on Product, 15 Years on Motor"}',
    mrp: 18990,
    offerPrice: 13990,
    images: ['/images/seed/products/elica-chimney.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-01',
    updatedAt: '2026-06-10',
  },
  // Gas Stoves (cat10)
  {
    id: 'p23',
    name: 'Prestige Royale 3 Burner Gas Stove',
    slug: 'prestige-royale-3-stove',
    brandId: 'b22',
    categoryId: 'cat10',
    modelNumber: 'Royale 3',
    description: 'Elegant glass top gas stove with high efficiency brass burners and spill-proof design for premium durability.',
    specifications: '{"Burners":"3","Top Material":"Toughened Glass","Burner Material":"Brass","Warranty":"2 Years"}',
    mrp: 8200,
    offerPrice: 5990,
    images: ['/images/seed/products/prestige-gas-stove.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-02',
    updatedAt: '2026-06-11',
  },
  {
    id: 'p24',
    name: 'Sunflame GT 4 Burner Gas Stove',
    slug: 'sunflame-gt-4-stove',
    brandId: 'b23',
    categoryId: 'cat10',
    modelNumber: 'GT 4',
    description: 'Classic matte finish toughened glass gas stove with four highly efficient burners for cooking multiple dishes simultaneously.',
    specifications: '{"Burners":"4","Top Material":"Toughened Glass","Ignition":"Manual","Warranty":"2 Years"}',
    mrp: 9500,
    offerPrice: 6990,
    images: ['/images/seed/products/sunflame-gas-stove.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-03',
    updatedAt: '2026-06-12',
  },
  // Gharghanti (cat11)
  {
    id: 'p25',
    name: 'Milcent Classic Gharghanti',
    slug: 'milcent-classic-gharghanti',
    brandId: 'b24',
    categoryId: 'cat11',
    modelNumber: 'Classic 1HP',
    description: 'Heavy duty fully automatic domestic flour mill with child safety lock, auto-clean system, and energy-saving motor.',
    specifications: '{"Motor Power":"1 HP","Capacity":"8-10 kg/hr","Container Size":"4.5 kg","Warranty":"1 Year on Product, 3 Years on Motor"}',
    mrp: 21500,
    offerPrice: 17990,
    images: ['/images/seed/products/milcent-gharghanti.svg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-06-04',
    updatedAt: '2026-06-13',
  },
  {
    id: 'p26',
    name: 'Natraj Pride Gharghanti',
    slug: 'natraj-pride-gharghanti',
    brandId: 'b17',
    categoryId: 'cat11',
    modelNumber: 'Pride Plus',
    description: 'Beautiful wood-grain finish auto flour mill that grinds all grains and spices cleanly while preserving all vitamins.',
    specifications: '{"Motor Power":"1 HP","Capacity":"7-9 kg/hr","Hopper Capacity":"4.5 kg","Warranty":"1 Year on Product, 5 Years on Motor"}',
    mrp: 22800,
    offerPrice: 18990,
    images: ['/images/seed/products/natraj-gharghanti.svg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-06-05',
    updatedAt: '2026-06-14',
  },
  // LED TVs (cat12)
  {
    id: 'p27',
    name: 'Sony Bravia 55-inch 4K Ultra HD Smart LED TV',
    slug: 'sony-bravia-55-tv',
    brandId: 'b7',
    categoryId: 'cat12',
    modelNumber: 'KD-55X74K',
    description: 'Discover the colors of the real world on this 4K Smart TV. Experience clear sound and realistic detail with X1 processor.',
    specifications: '{"Screen Size":"55 inch","Resolution":"4K Ultra HD (3840x2160)","Refresh Rate":"60 Hz","Smart TV Features":"Google TV, Chromecast, Assistant","Warranty":"1 Year"}',
    mrp: 74900,
    offerPrice: 57900,
    images: ['/images/seed/products/sony-tv-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-15',
    updatedAt: '2026-06-01',
  },
  {
    id: 'p28',
    name: 'Sony Bravia 65-inch 4K Ultra HD Smart LED TV',
    slug: 'sony-bravia-65-tv',
    brandId: 'b7',
    categoryId: 'cat12',
    modelNumber: 'KD-65X80K',
    description: 'Premium Smart TV with Triluminos Pro display, Dolby Vision, and Dolby Atmos audio for a complete home cinema experience.',
    specifications: '{"Screen Size":"65 inch","Resolution":"4K Ultra HD","Speaker Output":"20 W","Processor":"4K HDR Processor X1","Warranty":"1 Year"}',
    mrp: 139900,
    offerPrice: 99900,
    images: ['/images/seed/products/sony-tv-2.jpg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-18',
    updatedAt: '2026-06-02',
  },
  // Microwaves (cat13)
  {
    id: 'p29',
    name: 'Haier 20L Solo Microwave Oven',
    slug: 'haier-20l-microwave',
    brandId: 'b13',
    categoryId: 'cat13',
    modelNumber: 'HIL2001MSBP',
    description: 'Simple and reliable solo microwave oven, best for reheating, quick defrosting, and simple baking.',
    specifications: '{"Capacity":"20 Litres","Type":"Solo Microwave","Control Type":"Jog Wheel + Buttons","Warranty":"1 Year on Product, 3 Years on Magnetron"}',
    mrp: 7500,
    offerPrice: 5490,
    images: ['/images/seed/products/haier-microwave-1.jpg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-20',
    updatedAt: '2026-06-03',
  },
  {
    id: 'p30',
    name: 'Samsung 28L Convection Microwave Oven',
    slug: 'samsung-28l-microwave',
    brandId: 'b15',
    categoryId: 'cat13',
    modelNumber: 'MC28A5013AK',
    description: 'Smart convection microwave oven with Slim Fry technology, tandoor heater, and ceramic enamel cavity for easy cleaning.',
    specifications: '{"Capacity":"28 Litres","Type":"Convection Microwave","Slim Fry":"Yes","Warranty":"1 Year on Product, 5 Years on Magnetron, 10 Years on Ceramic Cavity"}',
    mrp: 18500,
    offerPrice: 13990,
    images: ['/images/seed/products/samsung-microwave-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-22',
    updatedAt: '2026-06-04',
  },
  // Mixer Grinders (cat14)
  {
    id: 'p31',
    name: 'Sujata Dynamix 900W Mixer Grinder',
    slug: 'sujata-dynamix-grinder',
    brandId: 'b25',
    categoryId: 'cat14',
    modelNumber: 'Dynamix DX',
    description: 'Practical, sturdy mixer grinder with a 900W motor, double ball bearings, and stainless steel jars for heavy duty grinding.',
    specifications: '{"Power":"900 W","Jars Included":"3","Motor Speed":"22000 RPM","Warranty":"2 Years"}',
    mrp: 7200,
    offerPrice: 5850,
    images: ['/images/seed/products/sujata-mixer-grinder.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-05',
    updatedAt: '2026-06-15',
  },
  {
    id: 'p32',
    name: 'Philips HL7756 750W Mixer Grinder',
    slug: 'philips-750w-grinder',
    brandId: 'b19',
    categoryId: 'cat14',
    modelNumber: 'HL7756/00',
    description: 'Specially designed motor for continuous grinding of tough ingredients like black gram and turmeric.',
    specifications: '{"Power":"750 W","Jars Included":"3","Material":"ABS Plastic Body","Warranty":"2 Years"}',
    mrp: 5490,
    offerPrice: 4200,
    images: ['/images/seed/products/philips-mixer-grinder.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-06',
    updatedAt: '2026-06-16',
  },
  // Refrigerators (cat15)
  {
    id: 'p33',
    name: 'Samsung 253L 3 Star Double Door Refrigerator',
    slug: 'samsung-253l-fridge',
    brandId: 'b15',
    categoryId: 'cat15',
    modelNumber: 'RT28A3453S8',
    description: 'Frost-free double door refrigerator with digital inverter compressor for uniform cooling and energy savings.',
    specifications: '{"Capacity":"253 Litres","Energy Rating":"3 Star","Type":"Frost Free Double Door","Warranty":"1 Year on Product, 10 Years on Compressor"}',
    mrp: 32000,
    offerPrice: 24990,
    images: ['/images/seed/products/samsung-fridge-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-15',
    updatedAt: '2026-06-01',
  },
  {
    id: 'p34',
    name: 'LG 190L 4 Star Single Door Refrigerator',
    slug: 'lg-190l-fridge',
    brandId: 'b18',
    categoryId: 'cat15',
    modelNumber: 'GL-B201ASPY',
    description: 'Smart inverter compressor single door refrigerator with fast ice making technology and stabilizer-free operation.',
    specifications: '{"Capacity":"190 Litres","Energy Rating":"4 Star","Type":"Direct Cool Single Door","Warranty":"1 Year on Product, 10 Years on Compressor"}',
    mrp: 19800,
    offerPrice: 15490,
    images: ['/images/seed/products/lg-refrigerator.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-18',
    updatedAt: '2026-06-02',
  },
  // RO Systems (cat16)
  {
    id: 'p35',
    name: 'Kent Grand Plus RO Water Purifier',
    slug: 'kent-grand-plus-ro',
    brandId: 'b26',
    categoryId: 'cat16',
    modelNumber: 'Grand+',
    description: 'Multi-stage purification process of RO+UV+UF+TDS control that removes even dissolved impurities.',
    specifications: '{"Capacity":"9 Litres","Purification Rate":"20 L/hr","TDS Control":"Yes","Warranty":"1 Year + 3 Years Free Service"}',
    mrp: 19500,
    offerPrice: 15990,
    images: ['/images/seed/products/kent-ro-system.svg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-06-05',
    updatedAt: '2026-06-15',
  },
  {
    id: 'p36',
    name: 'Aquaguard Active Copper RO Purifier',
    slug: 'aquaguard-copper-ro',
    brandId: 'b27',
    categoryId: 'cat16',
    modelNumber: 'Active Copper',
    description: 'Features unique Active Copper technology that infuses copper ions into water, promoting health.',
    specifications: '{"Capacity":"7 Litres","Purification":"RO+UV+UF+Copper","Auto Shut Off":"Yes","Warranty":"1 Year"}',
    mrp: 18990,
    offerPrice: 14990,
    images: ['/images/seed/products/aquaguard-ro-system.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-06-07',
    updatedAt: '2026-06-16',
  },
  // Washing Machines (cat17)
  {
    id: 'p37',
    name: 'IFB 6kg 5 Star Front Load Washing Machine',
    slug: 'ifb-6kg-washer',
    brandId: 'b14',
    categoryId: 'cat17',
    modelNumber: 'Diva Aqua SX',
    description: 'Fully automatic front-loading washing machine with cradle wash for delicate clothes and aqua-energie filter.',
    specifications: '{"Capacity":"6 kg","Energy Rating":"5 Star","Spin Speed":"1000 RPM","Warranty":"4 Years Complete Machine Warranty"}',
    mrp: 28990,
    offerPrice: 22990,
    images: ['/images/seed/products/ifb-washer-1.jpg'],
    isFeatured: true,
    isActive: true,
    createdAt: '2026-05-10',
    updatedAt: '2026-06-01',
  },
  {
    id: 'p38',
    name: 'Samsung 7kg Top Load Washing Machine',
    slug: 'samsung-7kg-washer',
    brandId: 'b15',
    categoryId: 'cat17',
    modelNumber: 'WA70BG4441BY',
    description: 'Eco Bubble technology cleans clothes gently and efficiently, while the digital inverter motor offers long term reliability.',
    specifications: '{"Capacity":"7 kg","Energy Rating":"5 Star","Type":"Fully Automatic Top Load","Warranty":"2 Years on Product, 20 Years on Motor"}',
    mrp: 21990,
    offerPrice: 17490,
    images: ['/images/seed/products/samsung-washer.svg'],
    isFeatured: false,
    isActive: true,
    createdAt: '2026-05-14',
    updatedAt: '2026-06-02',
  }
];

const offers = [
  {
    id: 'o1',
    title: 'Inverter + Battery Combo Offer',
    slug: 'inverter-battery-combo',
    type: 'combo',
    description: 'Buy Luminous Zelio+ Inverter with Exide 150Ah Tubular Battery and get additional discount + free installation.',
    image: '/images/seed/offers/inverter-battery-combo.png',
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
    image: '/images/seed/offers/dj-stage-pack-offer.png',
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
    image: '/images/seed/offers/battery-exchange-mela.png',
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

// Persistent Cache for uploaded Cloudinary image public IDs
const uploadCachePath = path.resolve(process.cwd(), 'scripts', 'cloudinary-uploads.json');
let uploadCache = {};
try {
  if (fs.existsSync(uploadCachePath)) {
    uploadCache = JSON.parse(fs.readFileSync(uploadCachePath, 'utf8'));
  }
} catch (e) {
  console.warn('[Seed] Warning: Could not read scripts/cloudinary-uploads.json cache file.');
}

function saveUploadCache() {
  try {
    fs.writeFileSync(uploadCachePath, JSON.stringify(uploadCache, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Seed] Warning: Could not write scripts/cloudinary-uploads.json cache file.');
  }
}

async function uploadImageIfNeeded(localPath, defaultPublicId) {
  if (!localPath || typeof localPath !== 'string') return localPath;
  if (!localPath.startsWith('/')) return localPath; // Already uploaded / public ID

  if (uploadCache[localPath]) {
    return uploadCache[localPath];
  }

  const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(`[Seed] Cloudinary config missing for ${localPath}. Using default ID fallback: ${defaultPublicId}`);
    return defaultPublicId;
  }

  try {
    const absolutePath = path.join(process.cwd(), 'public', localPath);
    if (!fs.existsSync(absolutePath)) {
      console.warn(`[Seed] Warning: Local file not found at ${absolutePath}. Using default ID fallback: ${defaultPublicId}`);
      return defaultPublicId;
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramString = `public_id=${defaultPublicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramString).digest('hex');

    const fileBuffer = fs.readFileSync(absolutePath);
    const base64File = `data:image/${path.extname(absolutePath).slice(1)};base64,${fileBuffer.toString('base64')}`;

    const formData = new URLSearchParams();
    formData.append('file', base64File);
    formData.append('public_id', defaultPublicId);
    formData.append('timestamp', String(timestamp));
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    console.log(`[Seed] Cloudinary upload once: Uploading ${localPath} to Cloudinary as '${defaultPublicId}'...`);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.secure_url) {
      console.log(`[Seed] Upload success! Registered Cloudinary ID: ${data.public_id}`);
      uploadCache[localPath] = data.public_id;
      saveUploadCache();
      return data.public_id;
    } else {
      console.error(`[Seed] Cloudinary upload failed for ${localPath}:`, data.error?.message || data);
      return defaultPublicId;
    }
  } catch (error) {
    console.error(`[Seed] Error uploading ${localPath} to Cloudinary:`, error);
    return defaultPublicId;
  }
}

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
    await client.query('DELETE FROM bundle_rules');

    // 1. Resolve Settings Images
    settings.heroImage = await uploadImageIfNeeded(settings.heroImage, 'yash-electronics/general/hero');
    settings.logoUrl = await uploadImageIfNeeded(settings.logoUrl || '/icon-512.png', 'yash-electronics/general/logo');

    // 2. Resolve Category Images
    for (const category of categories) {
      const filename = path.parse(category.image).name;
      category.image = await uploadImageIfNeeded(category.image, `yash-electronics/categories/${filename}`);
    }

    // 3. Resolve Brand Logos
    for (const brand of brands) {
      const filename = path.parse(brand.logo).name;
      brand.logo = await uploadImageIfNeeded(brand.logo, `yash-electronics/brands/${filename}`);
    }

    // 4. Resolve Product Images
    for (const product of products) {
      const uploadedImages = [];
      for (const img of product.images) {
        const filename = path.parse(img).name;
        uploadedImages.push(await uploadImageIfNeeded(img, `yash-electronics/products/${filename}`));
      }
      product.images = uploadedImages;
    }

    // 5. Resolve Offer Images
    for (const offer of offers) {
      const filename = path.parse(offer.image).name;
      offer.image = await uploadImageIfNeeded(offer.image, `yash-electronics/offers/${filename}`);
    }

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

    console.log('[Seed] Inserting bundle rules...');
    const bundleRulesData = [
      {
        id: 'rule-b3',
        name: '3 Products Special Gift',
        nameGu: '૩ પ્રોડક્ટ્સ સ્પેશિયલ ગિફ્ટ',
        minQuantity: 3,
        rewardType: 'free_gift',
        rewardValue: 0,
        rewardDescription: 'Free Noise Bluetooth Soundbar',
        rewardDescriptionGu: 'મફત નોઈઝ બ્લૂટૂથ સાઉન્ડબાર',
        isActive: true,
      },
      {
        id: 'rule-b4',
        name: '4 Products Checkout Discount',
        nameGu: '૪ પ્રોડક્ટ્સ ચેકઆઉટ ડિસ્કાઉન્ટ',
        minQuantity: 4,
        rewardType: 'percentage_discount',
        rewardValue: 10,
        rewardDescription: '10% off your order total!',
        rewardDescriptionGu: 'તમારા ઓર્ડર પર ૧૦% વધારાનું ડિસ્કાઉન્ટ!',
        isActive: true,
      },
      {
        id: 'rule-b5',
        name: '5 Products Flat Discount',
        nameGu: '૫ પ્રોડક્ટ્સ ફ્લેટ ડિસ્કાઉન્ટ',
        minQuantity: 5,
        rewardType: 'flat_discount',
        rewardValue: 1000,
        rewardDescription: '₹1,000 flat discount applied at checkout!',
        rewardDescriptionGu: 'ઓર્ડર ચેકઆઉટ પર ₹૧,૦૦૦ ફ્લેટ ડિસ્કાઉન્ટ!',
        isActive: true,
      },
      {
        id: 'rule-b6',
        name: '6 Products Store Cash Voucher',
        nameGu: '૬ પ્રોડક્ટ્સ સ્ટોર કેશ વાઉચર',
        minQuantity: 6,
        rewardType: 'store_voucher',
        rewardValue: 0,
        rewardDescription: '₹1,500 Store Cash Voucher',
        rewardDescriptionGu: '₹૧,૫૦૦ સ્ટોર કેશ વાઉચર',
        isActive: true,
      }
    ];

    for (const rule of bundleRulesData) {
      await client.query(
        `INSERT INTO bundle_rules (id, name, name_gu, min_quantity, reward_type, reward_value, reward_description, reward_description_gu, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          rule.id,
          rule.name,
          rule.nameGu,
          rule.minQuantity,
          rule.rewardType,
          rule.rewardValue,
          rule.rewardDescription,
          rule.rewardDescriptionGu,
          rule.isActive,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
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
