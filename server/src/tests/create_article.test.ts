
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articleContentsTable } from '../db/schema';
import { type CreateArticleInput } from '../schema';
import { createArticle } from '../handlers/create_article';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateArticleInput = {
  keyword: 'test keyword',
  content: 'This is a comprehensive test article content that provides valuable information about the test keyword and related topics.',
  word_count: 150
};

describe('createArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an article', async () => {
    const result = await createArticle(testInput);

    // Basic field validation
    expect(result.keyword).toEqual('test keyword');
    expect(result.content).toEqual(testInput.content);
    expect(result.word_count).toEqual(150);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save article to database', async () => {
    const result = await createArticle(testInput);

    // Query database to verify article was saved
    const articles = await db.select()
      .from(articleContentsTable)
      .where(eq(articleContentsTable.id, result.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].keyword).toEqual('test keyword');
    expect(articles[0].content).toEqual(testInput.content);
    expect(articles[0].word_count).toEqual(150);
    expect(articles[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different word counts correctly', async () => {
    const longArticleInput: CreateArticleInput = {
      keyword: 'long article keyword',
      content: 'This is a much longer article content with many more words to test the word count functionality and ensure proper handling of larger content pieces.',
      word_count: 2500
    };

    const result = await createArticle(longArticleInput);

    expect(result.word_count).toEqual(2500);
    expect(result.keyword).toEqual('long article keyword');
    expect(result.id).toBeDefined();

    // Verify in database
    const savedArticle = await db.select()
      .from(articleContentsTable)
      .where(eq(articleContentsTable.id, result.id))
      .execute();

    expect(savedArticle[0].word_count).toEqual(2500);
  });

  it('should handle zero word count', async () => {
    const emptyInput: CreateArticleInput = {
      keyword: 'empty keyword',
      content: '',
      word_count: 0
    };

    const result = await createArticle(emptyInput);

    expect(result.word_count).toEqual(0);
    expect(result.content).toEqual('');
    expect(result.keyword).toEqual('empty keyword');
    expect(result.id).toBeDefined();
  });
});
