import { pgTable, text, serial, timestamp, integer, json, date, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Articles table
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  imageUrl: text('image_url'),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  isFeatured: boolean('is_featured').default(false),
  viewCount: integer('view_count').default(0),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// EPaper table
export const epapers = pgTable('epapers', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  publishDate: date('publish_date').notNull(),
  imageUrl: text('image_url').notNull(),
  pdfUrl: text('pdf_url').notNull(),
  isLatest: boolean('is_latest').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Weather table
export const weather = pgTable('weather', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  temperature: integer('temperature').notNull(),
  condition: text('condition').notNull(),
  icon: text('icon').notNull(),
  forecast: json('forecast'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Breaking News table
export const breakingNews = pgTable('breaking_news', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Users table (already defined)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles)
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id]
  })
}));

// Zod Schemas
export const categoriesInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  slug: (schema) => schema.min(2, "Slug must be at least 2 characters")
});
export type CategoryInsert = z.infer<typeof categoriesInsertSchema>;
export const categoriesSelectSchema = createSelectSchema(categories);
export type Category = z.infer<typeof categoriesSelectSchema>;

export const articlesInsertSchema = createInsertSchema(articles, {
  title: (schema) => schema.min(5, "Title must be at least 5 characters"),
  content: (schema) => schema.min(20, "Content must be at least 20 characters"),
  slug: (schema) => schema.min(5, "Slug must be at least 5 characters")
});
export type ArticleInsert = z.infer<typeof articlesInsertSchema>;
export const articlesSelectSchema = createSelectSchema(articles);
export type Article = z.infer<typeof articlesSelectSchema>;

export const epapersInsertSchema = createInsertSchema(epapers);
export type EPaperInsert = z.infer<typeof epapersInsertSchema>;
export const epapersSelectSchema = createSelectSchema(epapers);
export type EPaper = z.infer<typeof epapersSelectSchema>;

export const weatherInsertSchema = createInsertSchema(weather);
export type WeatherInsert = z.infer<typeof weatherInsertSchema>;
export const weatherSelectSchema = createSelectSchema(weather);
export type Weather = z.infer<typeof weatherSelectSchema>;

export const breakingNewsInsertSchema = createInsertSchema(breakingNews, {
  content: (schema) => schema.min(10, "Content must be at least 10 characters")
});
export type BreakingNewsInsert = z.infer<typeof breakingNewsInsertSchema>;
export const breakingNewsSelectSchema = createSelectSchema(breakingNews);
export type BreakingNews = z.infer<typeof breakingNewsSelectSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
