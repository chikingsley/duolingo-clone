import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';

// Import routes
import { coursesRoutes } from './routes/courses';
import { unitsRoutes } from './routes/units';
import { lessonsRoutes } from './routes/lessons';
import { challengesRoutes } from './routes/challenges';
import { challengeOptionsRoutes } from './routes/challenge-options';
import { userProgressRoutes } from './routes/user-progress';
import { stripeRoutes } from './routes/stripe';

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Read HTML file for SPA
const htmlPath = `${import.meta.dir}/../../public/index.html`;
const htmlFile = Bun.file(htmlPath);

const app = new Elysia()
  .use(cors({
    origin: true,
    credentials: true,
  }))
  // Serve static files from public directory
  .use(staticPlugin({
    assets: 'public',
    prefix: '/',
  }))
  // API routes
  .group('/api', (app) =>
    app
      .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
      .use(coursesRoutes)
      .use(unitsRoutes)
      .use(lessonsRoutes)
      .use(challengesRoutes)
      .use(challengeOptionsRoutes)
      .use(userProgressRoutes)
      .use(stripeRoutes)
  )
  // Serve source files directly (Bun will handle TypeScript/JSX transpilation)
  .get('/src/*', async ({ request }) => {
    const url = new URL(request.url);
    const filePath = `${import.meta.dir}/../..${url.pathname}`;

    try {
      const file = Bun.file(filePath);
      const content = await file.text();

      // Determine content type based on file extension
      let contentType = 'text/plain';
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        contentType = 'application/javascript; charset=utf-8';
      } else if (filePath.endsWith('.css')) {
        contentType = 'text/css; charset=utf-8';
      } else if (filePath.endsWith('.json')) {
        contentType = 'application/json; charset=utf-8';
      }

      return new Response(content, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response('Not Found', { status: 404 });
    }
  })
  // Frontend routes - serve the SPA for all non-API routes
  .get('*', async ({ set }) => {
    set.headers['Content-Type'] = 'text/html; charset=utf-8';
    return htmlFile;
  })
  .listen({
    port: PORT,
    development: isDev,
  });

console.log(
  `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
);

console.log(`📦 Environment: ${isDev ? 'development' : 'production'}`);
console.log(`🎨 Frontend: React SPA with Bun runtime`);
console.log(`⚡ Backend: Elysia API`);
console.log(`\n📋 Try it out:`);
console.log(`   Frontend: http://localhost:${PORT}`);
console.log(`   API: http://localhost:${PORT}/api/health`);

export type App = typeof app;
