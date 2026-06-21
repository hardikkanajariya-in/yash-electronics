import { pgTable, text, integer, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const categories = pgTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  nameGu: text('name_gu'),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  descriptionGu: text('description_gu'),
  icon: text('icon'),
  image: text('image'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const brands = pgTable('brands', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  nameGu: text('name_gu'),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const products = pgTable('products', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  nameGu: text('name_gu'),
  slug: text('slug').notNull().unique(),
  brandId: varchar('brand_id', { length: 255 }).references(() => brands.id, { onDelete: 'cascade' }),
  categoryId: varchar('category_id', { length: 255 }).references(() => categories.id, { onDelete: 'cascade' }),
  modelNumber: text('model_number'),
  description: text('description'),
  descriptionGu: text('description_gu'),
  specifications: text('specifications'), // Stored as a JSON string for consistency
  specificationsGu: text('specifications_gu'),
  mrp: integer('mrp').notNull().default(0),
  offerPrice: integer('offer_price').notNull().default(0),
  images: text('images').array().notNull().default([]), // Postgres array of texts
  isFeatured: boolean('is_featured').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
}));

export const offers = pgTable('offers', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  titleGu: text('title_gu'),
  slug: text('slug').notNull().unique(),
  type: text('type').$type<'combo' | 'bundle' | 'weekly' | 'festival'>().notNull(),
  description: text('description'),
  descriptionGu: text('description_gu'),
  image: text('image'),
  discountText: text('discount_text'),
  discountTextGu: text('discount_text_gu'),
  validUntil: text('valid_until'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  couponCode: text('coupon_code'),
  discountType: text('discount_type').$type<'percentage' | 'flat'>().default('flat'),
  discountValue: integer('discount_value').default(0),
  minOrderValue: integer('min_order_value').default(0),
  discountCap: integer('discount_cap'),
});

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull().unique(),
  email: text('email').unique(),
  password: text('password').notNull(),
  role: text('role').$type<'admin' | 'customer'>().notNull().default('customer'),
  referralCode: text('referral_code').notNull().unique(),
  referredById: varchar('referred_by_id', { length: 255 }),
  credits: integer('credits').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  referralsMade: many(referralHistory, { relationName: 'referrer' }),
  referralsReceived: many(referralHistory, { relationName: 'referred' }),
  serviceRequests: many(serviceRequests),
}));

export const orders = pgTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  creditsUsed: integer('credits_used').notNull().default(0),
  totalAmount: integer('total_amount').notNull().default(0),
  status: text('status').$type<'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'>().notNull().default('pending'),
  paymentStatus: text('payment_status').$type<'pending' | 'received'>().notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  couponCode: text('coupon_code'),
  discountApplied: integer('discount_applied').default(0),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItems = pgTable('order_items', {
  id: varchar('id', { length: 255 }).primaryKey(),
  orderId: varchar('order_id', { length: 255 }).references(() => orders.id, { onDelete: 'cascade' }),
  productId: varchar('product_id', { length: 255 }).references(() => products.id),
  quantity: integer('quantity').notNull().default(1),
  price: integer('price').notNull().default(0),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const contactQueries = pgTable('contact_queries', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  status: text('status').$type<'unread' | 'read' | 'resolved'>().notNull().default('unread'),
  createdAt: text('created_at').notNull(),
});

// ─── NEW TABLES ──────────────────────────────────────────────

/**
 * Team Members — Sales & Service staff
 */
export const teamMembers = pgTable('team_members', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  photo: text('photo'),
  phone: text('phone'),
  role: text('role').$type<'sales_head' | 'sales_staff' | 'service_head' | 'service_staff' | 'account_head' | 'chief_accountant' | 'accountant'>().notNull(),
  department: text('department').$type<'sales' | 'service' | 'chief_account' | 'account_staff' | 'account'>().notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

/**
 * Services — Inverter Installation, Battery Replacement, etc.
 */
export const services = pgTable('services', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  image: text('image'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

/**
 * About Info — Founder, Owner, Next-Gen leadership
 */
export const aboutInfo = pgTable('about_info', {
  id: varchar('id', { length: 255 }).primaryKey(),
  role: text('role').$type<'founder' | 'owner' | 'next_gen'>().notNull(),
  name: text('name').notNull(),
  photo: text('photo'),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
});

/**
 * Bank Details — Payment information for customers
 */
export const bankDetails = pgTable('bank_details', {
  id: varchar('id', { length: 255 }).primaryKey(),
  bankName: text('bank_name').notNull(),
  accountHolderName: text('account_holder_name').notNull(),
  accountNumber: text('account_number').notNull(),
  ifscCode: text('ifsc_code').notNull(),
  branchName: text('branch_name').notNull(),
  upiQrCode: text('upi_qr_code'),
  bankQrCode: text('bank_qr_code'),
  isActive: boolean('is_active').notNull().default(true),
});

/**
 * Business Hours — Structured hours per day
 */
export const businessHours = pgTable('business_hours', {
  id: varchar('id', { length: 255 }).primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ...
  label: text('label').notNull(), // "Monday", "Sunday", etc.
  openTime: text('open_time'), // "09:30"
  closeTime: text('close_time'), // "21:00"
  isOpen: boolean('is_open').notNull().default(true),
  note: text('note'), // "Occasionally Open"
});

/**
 * Referral History — Track individual referral events
 */
export const referralHistory = pgTable('referral_history', {
  id: varchar('id', { length: 255 }).primaryKey(),
  referrerId: varchar('referrer_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: varchar('referred_user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  pointsEarned: integer('points_earned').notNull().default(0),
  type: text('type').$type<'referrer_bonus' | 'signup_bonus'>().notNull(),
  createdAt: text('created_at').notNull(),
});

export const referralHistoryRelations = relations(referralHistory, ({ one }) => ({
  referrer: one(users, {
    fields: [referralHistory.referrerId],
    references: [users.id],
    relationName: 'referrer',
  }),
  referredUser: one(users, {
    fields: [referralHistory.referredUserId],
    references: [users.id],
    relationName: 'referred',
  }),
}));

/**
 * Service Requests (SR) — Customer complaints and tracking
 */
export const serviceRequests = pgTable('service_requests', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  productName: text('product_name').notNull(),
  complaintDetails: text('complaint_details').notNull(),
  address: text('address'),
  pincode: text('pincode'),
  village: text('village'),
  productCategory: text('product_category'),
  brandName: text('brand_name'),
  modelNumber: text('model_number'),
  fault: text('fault'),
  status: text('status').$type<'pending' | 'in_progress' | 'resolved' | 'cancelled'>().notNull().default('pending'),
  trackingInfo: text('tracking_info'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  user: one(users, {
    fields: [serviceRequests.userId],
    references: [users.id],
  }),
}));

/**
 * Reviews — Product ratings and reviews submitted by customers
 */
export const reviews = pgTable('reviews', {
  id: varchar('id', { length: 255 }).primaryKey(),
  productId: varchar('product_id', { length: 255 }).references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  userName: text('user_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  purchaseSource: text('purchase_source').$type<'online' | 'instore' | 'seeded'>().notNull().default('online'),
  createdAt: text('created_at').notNull(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

/**
 * Notifications — For in-app notification tracking
 */
export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  type: text('type').$type<'contact' | 'service' | 'order'>().notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  referenceId: text('reference_id').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: text('created_at').notNull(),
});

/**
 * Push Subscriptions — For offline Web Push notifications via service worker
 */
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: text('created_at').notNull(),
});

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));


