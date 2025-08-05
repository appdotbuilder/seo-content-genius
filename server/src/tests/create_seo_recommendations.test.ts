
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articleContentsTable, seoRecommendationsTable } from '../db/schema';
import { type CreateSeoRecommendationsInput, type CreateArticleInput } from '../schema';
import { createSeoRecommendations } from '../handlers/create_seo_recommendations';
import { eq } from 'drizzle-orm';

describe('createSeoRecommendations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create SEO recommendations', async () => {
    // Create prerequisite article first
    const articleResult = await db.insert(articleContentsTable)
      .values({
        keyword: 'test keyword',
        content: 'Test article content',
        word_count: 100
      })
      .returning()
      .execute();

    const article = articleResult[0];

    const testInput: CreateSeoRecommendationsInput = {
      article_id: article.id,
      seo_title: 'Test SEO Title',
      meta_description: 'Test meta description for SEO optimization',
      url_slug: 'test-seo-title',
      lsi_keywords: ['test', 'seo', 'optimization'],
      heading_structure: '{"h1":"Test SEO Title","h2":["Introduction","Benefits"],"h3":["Overview","Details"]}'
    };

    const result = await createSeoRecommendations(testInput);

    // Basic field validation
    expect(result.article_id).toEqual(article.id);
    expect(result.seo_title).toEqual('Test SEO Title');
    expect(result.meta_description).toEqual(testInput.meta_description);
    expect(result.url_slug).toEqual('test-seo-title');
    expect(result.lsi_keywords).toEqual(['test', 'seo', 'optimization']);
    expect(result.heading_structure).toEqual(testInput.heading_structure);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save SEO recommendations to database', async () => {
    // Create prerequisite article
    const articleResult = await db.insert(articleContentsTable)
      .values({
        keyword: 'database test',
        content: 'Database test content',
        word_count: 150
      })
      .returning()
      .execute();

    const article = articleResult[0];

    const testInput: CreateSeoRecommendationsInput = {
      article_id: article.id,
      seo_title: 'Database Test SEO',
      meta_description: 'Meta description for database test',
      url_slug: 'database-test-seo',
      lsi_keywords: ['database', 'test', 'seo'],
      heading_structure: '{"h1":"Database Test","h2":["Setup","Testing"],"h3":["Configuration","Validation"]}'
    };

    const result = await createSeoRecommendations(testInput);

    // Query database to verify record was saved
    const seoRecommendations = await db.select()
      .from(seoRecommendationsTable)
      .where(eq(seoRecommendationsTable.id, result.id))
      .execute();

    expect(seoRecommendations).toHaveLength(1);
    expect(seoRecommendations[0].article_id).toEqual(article.id);
    expect(seoRecommendations[0].seo_title).toEqual('Database Test SEO');
    expect(seoRecommendations[0].meta_description).toEqual(testInput.meta_description);
    expect(seoRecommendations[0].url_slug).toEqual('database-test-seo');
    expect(seoRecommendations[0].lsi_keywords).toEqual(['database', 'test', 'seo']);
    expect(seoRecommendations[0].heading_structure).toEqual(testInput.heading_structure);
    expect(seoRecommendations[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle complex LSI keywords array', async () => {
    // Create prerequisite article
    const articleResult = await db.insert(articleContentsTable)
      .values({
        keyword: 'complex keywords',
        content: 'Complex keywords test content',
        word_count: 200
      })
      .returning()
      .execute();

    const article = articleResult[0];

    const complexKeywords = [
      'primary keyword',
      'secondary keyword',
      'long tail keyword phrase',
      'technical term',
      'industry jargon'
    ];

    const testInput: CreateSeoRecommendationsInput = {
      article_id: article.id,
      seo_title: 'Complex Keywords SEO Test',
      meta_description: 'Testing complex LSI keywords handling',
      url_slug: 'complex-keywords-seo-test',
      lsi_keywords: complexKeywords,
      heading_structure: '{"h1":"Complex Keywords","h2":["Primary","Secondary","Long Tail"],"h3":["Technical","Industry"]}'
    };

    const result = await createSeoRecommendations(testInput);

    expect(result.lsi_keywords).toEqual(complexKeywords);
    expect(result.lsi_keywords).toHaveLength(5);
    expect(result.lsi_keywords[2]).toEqual('long tail keyword phrase');
  });
});
