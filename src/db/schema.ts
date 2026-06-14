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
