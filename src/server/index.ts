import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { html } from '@elysiajs/html';

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

const app = new Elysia()
  .use(cors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  }))
  .use(html())
  .use(staticPlugin({
    assets: 'public',
    prefix: '/',
  }))
  // Health check
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  // API routes
  .use(coursesRoutes)
  .use(unitsRoutes)
  .use(lessonsRoutes)
  .use(challengesRoutes)
  .use(challengeOptionsRoutes)
  .use(userProgressRoutes)
  .use(stripeRoutes)
  .listen(PORT);

console.log(
  `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
);

console.log(`📦 Environment: ${isDev ? 'development' : 'production'}`);

export type App = typeof app;
