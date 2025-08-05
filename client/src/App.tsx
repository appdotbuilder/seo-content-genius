
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Copy, Loader2, Sparkles, Target, Search, FileText } from 'lucide-react';
import type { SeoContentResponse } from '../../server/src/schema';

function App() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contentData, setContentData] = useState<SeoContentResponse | null>(null);
  const [articleContent, setArticleContent] = useState('');
  const [copyNotification, setCopyNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotification(`${label} copied!`);
      setTimeout(() => setCopyNotification(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyNotification('Failed to copy');
      setTimeout(() => setCopyNotification(null), 2000);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await trpc.generateSeoContent.mutate({ keyword: keyword.trim() });
      setContentData(response);
      setArticleContent(response.article.content);
    } catch (error) {
      console.error('Failed to generate content:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const headingStructure = contentData?.seo_recommendations?.heading_structure 
    ? JSON.parse(contentData.seo_recommendations.heading_structure) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">SEO Content Genius</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Transform your keywords into SEO-optimized articles with AI-powered recommendations
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Generate SEO Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter your main keyword (e.g., 'digital marketing strategies')"
                  value={keyword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                  className="text-lg h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !keyword.trim()}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Generate Content & SEO Analysis
                  </>
                )}
              </Button>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copy Notification */}
        {copyNotification && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
            {copyNotification}
          </div>
        )}

        {/* Output Section */}
        {contentData && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Article Draft Column */}
            <div className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Article Draft
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={articleContent}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setArticleContent(e.target.value)}
                    className="min-h-96 text-sm leading-relaxed"
                    placeholder="Your generated article will appear here..."
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Word Count: <span className="font-semibold">{articleContent.split(/\s+/).filter(word => word.length > 0).length}</span>
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(articleContent, 'Article')}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SEO Recommendations Column */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                SEO Recommendations
              </h2>

              {/* SEO Title */}
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">SEO Title Tag</CardTitle>
                  <p className="text-sm text-gray-600">Under 60 characters</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{contentData.seo_recommendations.seo_title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {contentData.seo_recommendations.seo_title.length} characters
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(contentData.seo_recommendations.seo_title, 'SEO Title')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Meta Description */}
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Meta Description</CardTitle>
                  <p className="text-sm text-gray-600">Under 160 characters</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm">{contentData.seo_recommendations.meta_description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {contentData.seo_recommendations.meta_description.length} characters
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(contentData.seo_recommendations.meta_description, 'Meta Description')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* URL Slug */}
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">URL Slug</CardTitle>
                  <p className="text-sm text-gray-600">SEO-friendly URL structure</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center gap-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                      /{contentData.seo_recommendations.url_slug}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(contentData.seo_recommendations.url_slug, 'URL Slug')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* LSI Keywords */}
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Related (LSI) Keywords</CardTitle>
                      <p className="text-sm text-gray-600">5-7 semantic keywords</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(contentData.seo_recommendations.lsi_keywords.join(', '), 'LSI Keywords')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {contentData.seo_recommendations.lsi_keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Heading Structure */}
              {headingStructure && (
                <Card className="shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Heading Structure</CardTitle>
                        <p className="text-sm text-gray-600">H1, H2, H3 organization</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(
                          `H1: ${headingStructure.h1}\n\nH2 Sections:\n${headingStructure.h2.map((h2: string) => `• ${h2}`).join('\n')}\n\nH3 Sections:\n${headingStructure.h3.map((h3: string) => `• ${h3}`).join('\n')}`,
                          'Heading Structure'
                        )}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">H1:</h4>
                      <p className="text-sm bg-blue-50 p-2 rounded">{headingStructure.h1}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">H2 Sections:</h4>
                      <ul className="space-y-1">
                        {headingStructure.h2.map((h2: string, index: number) => (
                          <li key={index} className="text-sm bg-green-50 p-2 rounded">
                            • {h2}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">H3 Sections:</h4>
                      <ul className="space-y-1">
                        {headingStructure.h3.map((h3: string, index: number) => (
                          <li key={index} className="text-sm bg-purple-50 p-2 rounded">
                            • {h3}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!contentData && !isLoading && (
          <Card className="text-center py-12 shadow-md">
            <CardContent>
              <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Ready to Create Amazing Content?
              </h3>
              <p className="text-gray-500">
                Enter a keyword above to generate SEO-optimized articles with AI-powered recommendations
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
