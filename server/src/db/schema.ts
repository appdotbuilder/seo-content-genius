
import { serial, text, pgTable, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const articleContentsTable = pgTable('article_contents', {
  id: serial('id').primaryKey(),
  keyword: text('keyword').notNull(),
  content: text('content').notNull(),
  word_count: integer('word_count').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const seoRecommendationsTable = pgTable('seo_recommendations', {
  id: serial('id').primaryKey(),
  article_id: integer('article_id').notNull().references(() => articleContentsTable.id),
  seo_title: text('seo_title').notNull(),
  meta_description: text('meta_description').notNull(),
  url_slug: text('url_slug').notNull(),
  lsi_keywords: jsonb('lsi_keywords').notNull(), // Store array of strings as JSONB
  heading_structure: text('heading_structure').notNull(), // JSON string for H1, H2, H3 structure
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const articleContentsRelations = relations(articleContentsTable, ({ one }) => ({
  seoRecommendations: one(seoRecommendationsTable, {
    fields: [articleContentsTable.id],
    references: [seoRecommendationsTable.article_id],
  }),
}));

export const seoRecommendationsRelations = relations(seoRecommendationsTable, ({ one }) => ({
  article: one(articleContentsTable, {
    fields: [seoRecommendationsTable.article_id],
    references: [articleContentsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type ArticleContent = typeof articleContentsTable.$inferSelect;
export type NewArticleContent = typeof articleContentsTable.$inferInsert;
export type SeoRecommendations = typeof seoRecommendationsTable.$inferSelect;
export type NewSeoRecommendations = typeof seoRecommendationsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  articleContents: articleContentsTable,
  seoRecommendations: seoRecommendationsTable
};
