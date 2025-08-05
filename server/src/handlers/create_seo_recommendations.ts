
import { db } from '../db';
import { seoRecommendationsTable } from '../db/schema';
import { type CreateSeoRecommendationsInput, type SeoRecommendations } from '../schema';

export const createSeoRecommendations = async (input: CreateSeoRecommendationsInput): Promise<SeoRecommendations> => {
  try {
    // Insert SEO recommendations record
    const result = await db.insert(seoRecommendationsTable)
      .values({
        article_id: input.article_id,
        seo_title: input.seo_title,
        meta_description: input.meta_description,
        url_slug: input.url_slug,
        lsi_keywords: input.lsi_keywords, // JSONB column - no conversion needed
        heading_structure: input.heading_structure
      })
      .returning()
      .execute();

    // Return the created SEO recommendations record
    const seoRecommendations = result[0];
    return {
      ...seoRecommendations,
      lsi_keywords: seoRecommendations.lsi_keywords as string[] // Type assertion for JSONB
    };
  } catch (error) {
    console.error('SEO recommendations creation failed:', error);
    throw error;
  }
};
