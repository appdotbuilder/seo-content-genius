
import { db } from '../db';
import { articleContentsTable } from '../db/schema';
import { type CreateArticleInput, type ArticleContent } from '../schema';

export const createArticle = async (input: CreateArticleInput): Promise<ArticleContent> => {
  try {
    // Insert article content record
    const result = await db.insert(articleContentsTable)
      .values({
        keyword: input.keyword,
        content: input.content,
        word_count: input.word_count
      })
      .returning()
      .execute();

    // Return the created article
    const article = result[0];
    return {
      id: article.id,
      keyword: article.keyword,
      content: article.content,
      word_count: article.word_count,
      created_at: article.created_at
    };
  } catch (error) {
    console.error('Article creation failed:', error);
    throw error;
  }
};
