
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas and handlers
import { generateContentRequestSchema } from './schema';
import { generateSeoContent } from './handlers/generate_seo_content';
import { getArticleWithSeo } from './handlers/get_article_with_seo';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Generate complete SEO content (article + recommendations)
  generateSeoContent: publicProcedure
    .input(generateContentRequestSchema)
    .mutation(({ input }) => generateSeoContent(input)),
  
  // Get article with SEO recommendations by ID
  getArticleWithSeo: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(({ input }) => getArticleWithSeo(input.articleId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
