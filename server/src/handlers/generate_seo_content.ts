
import { db } from '../db';
import { articleContentsTable, seoRecommendationsTable } from '../db/schema';
import { type GenerateContentRequest, type SeoContentResponse } from '../schema';

export async function generateSeoContent(input: GenerateContentRequest): Promise<SeoContentResponse> {
  try {
    // Generate article content based on keyword
    const articleContent = `# The Ultimate Guide to ${input.keyword}

## Introduction to ${input.keyword}

${input.keyword} is a crucial topic that deserves comprehensive coverage. This guide will provide you with everything you need to know about ${input.keyword}, including best practices, common mistakes to avoid, and advanced techniques.

## Benefits of ${input.keyword}

Understanding ${input.keyword} can provide numerous advantages:
- Improved knowledge and expertise
- Better decision-making capabilities
- Enhanced performance and results
- Competitive advantage in your field

## Best Practices for ${input.keyword}

### Getting Started
When beginning with ${input.keyword}, it's important to start with the fundamentals and build your understanding gradually.

### Common Mistakes
Avoid these common pitfalls when working with ${input.keyword}:
- Rushing into advanced concepts without mastering the basics
- Ignoring industry best practices
- Failing to stay updated with latest trends

### Advanced Techniques
Once you've mastered the basics of ${input.keyword}, you can explore more sophisticated approaches and strategies.

## Conclusion

${input.keyword} is an essential topic that requires careful study and practical application. By following this guide, you'll be well-equipped to succeed in your ${input.keyword} endeavors.`;

    // Calculate word count
    const wordCount = articleContent.split(/\s+/).length;

    // Insert article content
    const articleResult = await db.insert(articleContentsTable)
      .values({
        keyword: input.keyword,
        content: articleContent,
        word_count: wordCount
      })
      .returning()
      .execute();

    const article = articleResult[0];

    // Generate SEO recommendations
    const urlSlug = input.keyword.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    const lsiKeywords = [
      `${input.keyword} guide`,
      `${input.keyword} tips`,
      `${input.keyword} strategies`,
      `${input.keyword} best practices`,
      `how to ${input.keyword}`
    ];

    const headingStructure = JSON.stringify({
      h1: `The Ultimate Guide to ${input.keyword}`,
      h2: [
        `Introduction to ${input.keyword}`,
        `Benefits of ${input.keyword}`,
        `Best Practices for ${input.keyword}`
      ],
      h3: [
        'Getting Started',
        'Common Mistakes',
        'Advanced Techniques'
      ]
    });

    // Insert SEO recommendations
    const seoResult = await db.insert(seoRecommendationsTable)
      .values({
        article_id: article.id,
        seo_title: `${input.keyword} - Complete Guide 2024`,
        meta_description: `Discover everything about ${input.keyword}. Complete guide with tips, strategies, and best practices for ${input.keyword} success.`,
        url_slug: urlSlug,
        lsi_keywords: lsiKeywords,
        heading_structure: headingStructure
      })
      .returning()
      .execute();

    const seoRecommendations = seoResult[0];

    return {
      article: {
        id: article.id,
        keyword: article.keyword,
        content: article.content,
        word_count: article.word_count,
        created_at: article.created_at
      },
      seo_recommendations: {
        id: seoRecommendations.id,
        article_id: seoRecommendations.article_id,
        seo_title: seoRecommendations.seo_title,
        meta_description: seoRecommendations.meta_description,
        url_slug: seoRecommendations.url_slug,
        lsi_keywords: seoRecommendations.lsi_keywords as string[],
        heading_structure: seoRecommendations.heading_structure,
        created_at: seoRecommendations.created_at
      }
    };
  } catch (error) {
    console.error('SEO content generation failed:', error);
    throw error;
  }
}
