
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articleContentsTable, seoRecommendationsTable } from '../db/schema';
import { type GenerateContentRequest } from '../schema';
import { generateSeoContent } from '../handlers/generate_seo_content';
import { eq } from 'drizzle-orm';

const testInput: GenerateContentRequest = {
  keyword: 'Digital Marketing'
};

describe('generateSeoContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate SEO content with article and recommendations', async () => {
    const result = await generateSeoContent(testInput);

    // Validate article content
    expect(result.article.keyword).toEqual('Digital Marketing');
    expect(result.article.content).toContain('Digital Marketing');
    expect(result.article.content).toContain('The Ultimate Guide to Digital Marketing');
    expect(typeof result.article.word_count).toBe('number');
    expect(result.article.word_count).toBeGreaterThan(0);
    expect(result.article.id).toBeDefined();
    expect(result.article.created_at).toBeInstanceOf(Date);

    // Validate SEO recommendations
    expect(result.seo_recommendations.article_id).toEqual(result.article.id);
    expect(result.seo_recommendations.seo_title).toEqual('Digital Marketing - Complete Guide 2024');
    expect(result.seo_recommendations.meta_description).toContain('Digital Marketing');
    expect(result.seo_recommendations.url_slug).toEqual('digital-marketing');
    expect(Array.isArray(result.seo_recommendations.lsi_keywords)).toBe(true);
    expect(result.seo_recommendations.lsi_keywords).toContain('Digital Marketing guide');
    expect(result.seo_recommendations.heading_structure).toBeDefined();
    expect(result.seo_recommendations.id).toBeDefined();
    expect(result.seo_recommendations.created_at).toBeInstanceOf(Date);
  });

  it('should save article content to database', async () => {
    const result = await generateSeoContent(testInput);

    const articles = await db.select()
      .from(articleContentsTable)
      .where(eq(articleContentsTable.id, result.article.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].keyword).toEqual('Digital Marketing');
    expect(articles[0].content).toContain('Digital Marketing');
    expect(articles[0].word_count).toBeGreaterThan(0);
    expect(articles[0].created_at).toBeInstanceOf(Date);
  });

  it('should save SEO recommendations to database', async () => {
    const result = await generateSeoContent(testInput);

    const seoRecs = await db.select()
      .from(seoRecommendationsTable)
      .where(eq(seoRecommendationsTable.id, result.seo_recommendations.id))
      .execute();

    expect(seoRecs).toHaveLength(1);
    expect(seoRecs[0].article_id).toEqual(result.article.id);
    expect(seoRecs[0].seo_title).toEqual('Digital Marketing - Complete Guide 2024');
    expect(seoRecs[0].meta_description).toContain('Digital Marketing');
    expect(seoRecs[0].url_slug).toEqual('digital-marketing');
    expect(Array.isArray(seoRecs[0].lsi_keywords)).toBe(true);
    expect(seoRecs[0].heading_structure).toBeDefined();
    expect(seoRecs[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle keywords with special characters', async () => {
    const specialKeywordInput: GenerateContentRequest = {
      keyword: 'AI & Machine Learning!'
    };

    const result = await generateSeoContent(specialKeywordInput);

    expect(result.article.keyword).toEqual('AI & Machine Learning!');
    expect(result.seo_recommendations.url_slug).toEqual('ai-machine-learning');
    expect(result.seo_recommendations.seo_title).toContain('AI & Machine Learning!');
  });

  it('should generate different content for different keywords', async () => {
    const keyword1Input: GenerateContentRequest = { keyword: 'SEO' };
    const keyword2Input: GenerateContentRequest = { keyword: 'Content Marketing' };

    const result1 = await generateSeoContent(keyword1Input);
    const result2 = await generateSeoContent(keyword2Input);

    expect(result1.article.keyword).toEqual('SEO');
    expect(result2.article.keyword).toEqual('Content Marketing');
    expect(result1.article.content).not.toEqual(result2.article.content);
    expect(result1.seo_recommendations.url_slug).toEqual('seo');
    expect(result2.seo_recommendations.url_slug).toEqual('content-marketing');
  });

  it('should create proper foreign key relationship', async () => {
    const result = await generateSeoContent(testInput);

    // Verify the foreign key relationship works
    const joinedResult = await db.select()
      .from(articleContentsTable)
      .innerJoin(
        seoRecommendationsTable,
        eq(articleContentsTable.id, seoRecommendationsTable.article_id)
      )
      .where(eq(articleContentsTable.id, result.article.id))
      .execute();

    expect(joinedResult).toHaveLength(1);
    expect(joinedResult[0].article_contents.id).toEqual(result.article.id);
    expect(joinedResult[0].seo_recommendations.article_id).toEqual(result.article.id);
  });
});
