
import { z } from 'zod';

// SEO Content Generation Request schema
export const generateContentRequestSchema = z.object({
  keyword: z.string().min(1, 'Keyword is required').max(100, 'Keyword must be under 100 characters')
});

export type GenerateContentRequest = z.infer<typeof generateContentRequestSchema>;

// Article Content schema
export const articleContentSchema = z.object({
  id: z.number(),
  keyword: z.string(),
  content: z.string(),
  word_count: z.number().int().nonnegative(),
  created_at: z.coerce.date()
});

export type ArticleContent = z.infer<typeof articleContentSchema>;

// SEO Recommendations schema
export const seoRecommendationsSchema = z.object({
  id: z.number(),
  article_id: z.number(),
  seo_title: z.string(),
  meta_description: z.string(),
  url_slug: z.string(),
  lsi_keywords: z.array(z.string()),
  heading_structure: z.string(), // JSON string containing H1, H2, H3 structure
  created_at: z.coerce.date()
});

export type SeoRecommendations = z.infer<typeof seoRecommendationsSchema>;

// Complete SEO Content Response schema
export const seoContentResponseSchema = z.object({
  article: articleContentSchema,
  seo_recommendations: seoRecommendationsSchema
});

export type SeoContentResponse = z.infer<typeof seoContentResponseSchema>;

// Input schema for creating article content
export const createArticleInputSchema = z.object({
  keyword: z.string(),
  content: z.string(),
  word_count: z.number().int().nonnegative()
});

export type CreateArticleInput = z.infer<typeof createArticleInputSchema>;

// Input schema for creating SEO recommendations
export const createSeoRecommendationsInputSchema = z.object({
  article_id: z.number(),
  seo_title: z.string(),
  meta_description: z.string(),
  url_slug: z.string(),
  lsi_keywords: z.array(z.string()),
  heading_structure: z.string()
});

export type CreateSeoRecommendationsInput = z.infer<typeof createSeoRecommendationsInputSchema>;

// AI Service Response schemas for parsing external API responses
export const aiArticleResponseSchema = z.object({
  content: z.string()
});

export type AiArticleResponse = z.infer<typeof aiArticleResponseSchema>;

export const aiSeoResponseSchema = z.object({
  seo_title: z.string(),
  meta_description: z.string(),
  url_slug: z.string(),
  lsi_keywords: z.array(z.string()),
  heading_structure: z.object({
    h1: z.string(),
    h2: z.array(z.string()),
    h3: z.array(z.string())
  })
});

export type AiSeoResponse = z.infer<typeof aiSeoResponseSchema>;
