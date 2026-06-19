import crypto from 'node:crypto';

const NAMES = [
  'Rajesh Patel', 'Amit Shah', 'Hardik Kanajariya', 'Priya Sharma', 'Vikram Rathod',
  'Ramesh Jadeja', 'Jayesh Savaliya', 'Neha Vyas', 'Jignesh Mewada', 'Mansukhbhai Patel',
  'Kirit Solanki', 'Pankaj Vaghela', 'Drashti Gohil', 'Sanjay Bhai', 'Nilesh Dave',
  'Ketan Parmar', 'Bhavesh Chotai', 'Hiren Nakum', 'Meera Trivedi', 'Rohan Sanghavi',
  'Arvind Gajera', 'Kamlesh Joshi', 'Manish Makwana', 'Dinesh Dabhi', 'Suresh Rathod'
];

const GENERAL_COMMENTS = [
  "Excellent product! Built quality is superior and works like a charm.",
  "Very happy with this purchase. Yash Electronics provided super fast delivery.",
  "Highly recommended. Authentic product with all warranty cards intact.",
  "Value for money. Using it daily and haven't faced any issues.",
  "Great customer service by the store team. The product exceeded my expectations.",
  "Genuine product, very well packaged. Works perfectly.",
  "Excellent build quality and reliable performance.",
  "Five stars! Extremely satisfied with the purchase and post-sales support.",
  "Very good product in this price segment. Highly recommended.",
  "Excellent service from Yash Electronics, they explained everything during setup."
];

const CATEGORY_COMMENTS: Record<string, string[]> = {
  'home-inverters': [
    "Amazing backup time! We get 6+ hours of backup easily on full load. Perfect for summers.",
    "Installed this last week. Pure sine wave output is clean, no humming noise in fans.",
    "Very reliable inverter. Charging is quick and it handles the load smoothly.",
    "Great product, works flawlessly during power cuts. Yash Electronics team did a clean setup.",
    "Power backup is fantastic. Automatic switchover is instant and seamless.",
    "Highly recommended for locations with frequent load shedding. Very silent."
  ],
  'batteries': [
    "Using it with my home UPS. Excellent power retention and long backup.",
    "Very heavy tubular battery, came with full charge. Low maintenance design is great.",
    "Decent warranty coverage. Exide/Amaron batteries are always dependable.",
    "Provides steady voltage. Yard/installation service by the store was neat and professional.",
    "Holds charge very well. Haven't needed to top up water in 6 months.",
    "Perfect companion for Luminous inverter. Excellent performance."
  ],
  'sound-systems': [
    "Unbelievable sound quality! Bass is deep and voice is crisp. Movie nights are fun now.",
    "Very premium design and rich soundbar output. Dolby Atmos effect is really good.",
    "Easy Bluetooth pairing and clear treble. Completely satisfied with the audio performance.",
    "Great sound clarity even at maximum volume. Definitely value for money.",
    "Surround sound is highly immersive. Feels like a theater at home.",
    "Sleek design, fits perfectly under my LED TV. Soundbar bass is punchy."
  ],
  'dj-speaker-systems': [
    "Extremely powerful bass and crystal clear high frequencies. Perfect for wedding sound setups.",
    "Professional grade DJ cabinet. Studio Master / JBL quality is outstanding.",
    "Heavy-duty construction, handles high volume input without distortion. Superb buy.",
    "Ideal for outdoor stages and events. Clear vocals and punchy bass.",
    "Best speakers for professional DJs. The cabinet design is very rugged and durable.",
    "High output amplifier matches these perfectly. Mind-blowing performance!"
  ],
  'air-conditioners': [
    "Cools the room in minutes. Highly energy efficient split inverter AC.",
    "Very quiet operation, sleep mode works perfectly. Perfect for hot summers.",
    "Great cooling capacity and low power consumption. Auto-clean feature is useful.",
    "Excellent service and fast installation by Yash Electronics team.",
    "Stabilizer-free operation works fine. Cools effectively even at 45 degrees.",
    "Very low noise levels. Five stars for blue star/daikin cooling technology."
  ],
  'air-coolers': [
    "Huge water tank and powerful air throw. Cools the room effectively.",
    "Honeycomb pads are of high quality. Low power usage compared to AC.",
    "Easy to move around with wheels. Air delivery is strong.",
    "Good desert cooler for summers. Noise level is acceptable.",
    "Ice chamber is very effective. Perfect product for hot dry climate."
  ],
  'refrigerators': [
    "Keeps veggies fresh and ice freezes super fast. Silent compressor.",
    "Very spacious shelves and energy efficient. Elegant look.",
    "Excellent cooling and storage options. Low electricity bills.",
    "Best single/double door fridge in this segment. Delivery was prompt.",
    "Convertible freezer modes are very useful. Sleek digital display on door."
  ],
  'ro-systems': [
    "Water taste improved significantly. Active copper technology is excellent.",
    "Multi-stage purification works perfectly. Regular service reminders are helpful.",
    "Compact design and zero water leakage. Purifies water quickly.",
    "Highly recommend for clean drinking water. Essential for families.",
    "TDS controller works fine. Clean and healthy alkaline water."
  ],
  'washing-machines': [
    "Washes clothes very clean. Cradle wash mode is gentle on premium clothes.",
    "Fully automatic operation saves water and time. Spin cycle dries clothes well.",
    "Low noise and vibration. Built-in heater is great for hot washes.",
    "Very sturdy build and user-friendly interface. Happy with the purchase.",
    "15-minute quick wash is highly convenient. Fabric care is excellent."
  ]
};

export async function seedReviewsForProduct(pool: any, productId: string, categorySlug: string | null) {
  // Generate random count of reviews: 3 to 10
  const reviewCount = Math.floor(Math.random() * 8) + 3; // 3 to 10
  
  const comments = categorySlug && CATEGORY_COMMENTS[categorySlug] 
    ? [...CATEGORY_COMMENTS[categorySlug], ...GENERAL_COMMENTS]
    : GENERAL_COMMENTS;

  for (let i = 0; i < reviewCount; i++) {
    const id = `rev-${crypto.randomBytes(8).toString('hex')}`;
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const rating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars (positive reviews)
    const comment = comments[Math.floor(Math.random() * comments.length)];
    
    // Random date in the last 90 days
    const dateOffset = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - dateOffset);
    const createdAt = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Set half as online and half as instore randomly
    const purchaseSource = Math.random() > 0.5 ? 'online' : 'instore';
    
    await pool.query(
      `INSERT INTO reviews (id, product_id, user_id, user_name, rating, comment, purchase_source, created_at)
       VALUES ($1, $2, NULL, $3, $4, $5, $6, $7)`,
      [id, productId, name, rating, comment, purchaseSource, createdAt]
    );
  }
}

export async function autoSeedEmptyProductReviews(pool: any) {
  try {
    // Find products that don't have reviews
    const res = await pool.query(`
      SELECT p.id, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id NOT IN (SELECT DISTINCT product_id FROM reviews)
    `);
    
    if (res.rows.length === 0) return;
    
    console.log(`[Review Seeder] Auto-seeding reviews for ${res.rows.length} products with 0 reviews...`);
    for (const row of res.rows) {
      await seedReviewsForProduct(pool, row.id, row.category_slug);
    }
    console.log(`[Review Seeder] Auto-seeding reviews completed successfully!`);
  } catch (e) {
    console.error('[Review Seeder] Failed to auto-seed reviews:', e);
  }
}
