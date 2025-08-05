
import { db } from '../db';
import { articleContentsTable, seoRecommendationsTable } from '../db/schema';
import { type SeoContentResponse } from '../schema';
import { eq } from 'drizzle-orm';

export async function getArticleWithSeo(articleId: number): Promise<SeoContentResponse | null> {
  try {
    // Query article with its SEO recommendations using a join
    const results = await db.select()
      .from(articleContentsTable)
      .innerJoin(
        seoRecommendationsTable,
        eq(articleContentsTable.id, seoRecommendationsTable.article_id)
      )
      .where(eq(articleContentsTable.id, articleId))
      .execute();

    // Return null if no results found
    if (results.length === 0) {
      return null;
    }

    // Extract data from joined result structure
    const result = results[0];
    const article = result.article_contents;
    const seoRecs = result.seo_recommendations;

    // Return formatted response matching the schema
    return {
      article: {
        id: article.id,
        keyword: article.keyword,
        content: article.content,
        word_count: article.word_count,
        created_at: article.created_at
      },
      seo_recommendations: {
        id: seoRecs.id,
        article_id: seoRecs.article_id,
        seo_title: seoRecs.seo_title,
        meta_description: seoRecs.meta_description,
        url_slug: seoRecs.url_slug,
        lsi_keywords: seoRecs.lsi_keywords as string[], // Cast JSONB to string array
        heading_structure: seoRecs.heading_structure,
        created_at: seoRecs.created_at
      }
    };
  } catch (error) {
    console.error('Failed to get article with SEO:', error);
    throw error;
  }
}
