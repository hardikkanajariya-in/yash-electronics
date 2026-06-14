import { pgTable, text, integer, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const categories = pgTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
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
  slug: text('slug').notNull().unique(),
  brandId: varchar('brand_id', { length: 255 }).references(() => brands.id, { onDelete: 'cascade' }),
  categoryId: varchar('category_id', { length: 255 }).references(() => categories.id, { onDelete: 'cascade' }),
  modelNumber: text('model_number'),
  description: text('description'),
  specifications: text('specifications'), // Stored as a JSON string for consistency
  mrp: integer('mrp').notNull().default(0),
  offerPrice: integer('offer_price').notNull().default(0),
  images: text('images').array().notNull().default([]), // Postgres array of texts
  isFeatured: boolean('is_featured').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const productsRelations = relations(products, ({ one }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const offers = pgTable('offers', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').$type<'combo' | 'bundle' | 'weekly' | 'festival'>().notNull(),
  description: text('description'),
  image: text('image'),
  discountText: text('discount_text'),
  validUntil: text('valid_until'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
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
}));

export const orders = pgTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  creditsUsed: integer('credits_used').notNull().default(0),
  totalAmount: integer('total_amount').notNull().default(0),
  status: text('status').$type<'pending' | 'processing' | 'delivered' | 'cancelled'>().notNull().default('pending'),
  createdAt: text('created_at').notNull(),
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
