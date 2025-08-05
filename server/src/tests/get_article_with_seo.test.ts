
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articleContentsTable, seoRecommendationsTable } from '../db/schema';
import { getArticleWithSeo } from '../handlers/get_article_with_seo';

describe('getArticleWithSeo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return article with SEO recommendations when found', async () => {
    // Create test article
    const articleResult = await db.insert(articleContentsTable)
      .values({
        keyword: 'test keyword',
        content: 'This is test article content',
        word_count: 5
      })
      .returning()
      .execute();

    const articleId = articleResult[0].id;

    // Create SEO recommendations for the article
    await db.insert(seoRecommendationsTable)
      .values({
        article_id: articleId,
        seo_title: 'Test SEO Title',
        meta_description: 'Test meta description',
        url_slug: 'test-keyword',
        lsi_keywords: ['related', 'keywords'],
        heading_structure: '{"h1":"Test H1","h2":["Test H2-1","Test H2-2"],"h3":["Test H3"]}'
      })
      .execute();

    // Test the handler
    const result = await getArticleWithSeo(articleId);

    expect(result).not.toBeNull();
    expect(result!.article.id).toBe(articleId);
    expect(result!.article.keyword).toBe('test keyword');
    expect(result!.article.content).toBe('This is test article content');
    expect(result!.article.word_count).toBe(5);
    expect(result!.article.created_at).toBeInstanceOf(Date);

    expect(result!.seo_recommendations.article_id).toBe(articleId);
    expect(result!.seo_recommendations.seo_title).toBe('Test SEO Title');
    expect(result!.seo_recommendations.meta_description).toBe('Test meta description');
    expect(result!.seo_recommendations.url_slug).toBe('test-keyword');
    expect(result!.seo_recommendations.lsi_keywords).toEqual(['related', 'keywords']);
    expect(result!.seo_recommendations.heading_structure).toBe('{"h1":"Test H1","h2":["Test H2-1","Test H2-2"],"h3":["Test H3"]}');
    expect(result!.seo_recommendations.created_at).toBeInstanceOf(Date);
  });

  it('should return null when article does not exist', async () => {
    const result = await getArticleWithSeo(99999);
    expect(result).toBeNull();
  });

  it('should return null when article exists but has no SEO recommendations', async () => {
    // Create article without SEO recommendations
    const articleResult = await db.insert(articleContentsTable)
      .values({
        keyword: 'orphan keyword',
        content: 'Article without SEO',
        word_count: 3
      })
      .returning()
      .execute();

    const result = await getArticleWithSeo(articleResult[0].id);
    expect(result).toBeNull();
  });

  it('should handle complex LSI keywords array correctly', async () => {
    // Create test article
    const articleResult = await db.insert(articleContentsTable)
      .values({
        keyword: 'complex test',
        content: 'Complex test content',
        word_count: 3
      })
      .returning()
      .execute();

    const complexKeywords = ['seo', 'optimization', 'content marketing', 'digital strategy'];

    // Create SEO recommendations with complex keywords
    await db.insert(seoRecommendationsTable)
      .values({
        article_id: articleResult[0].id,
        seo_title: 'Complex SEO Title',
        meta_description: 'Complex meta description',
        url_slug: 'complex-test',
        lsi_keywords: complexKeywords,
        heading_structure: '{"h1":"Main Title"}'
      })
      .execute();

    const result = await getArticleWithSeo(articleResult[0].id);

    expect(result).not.toBeNull();
    expect(result!.seo_recommendations.lsi_keywords).toEqual(complexKeywords);
    expect(Array.isArray(result!.seo_recommendations.lsi_keywords)).toBe(true);
    expect(result!.seo_recommendations.lsi_keywords).toHaveLength(4);
  });
});
