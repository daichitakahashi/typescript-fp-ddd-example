import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { registerRoutes } from './app';

(async () => {
  const app = new Hono();
  await registerRoutes(app);

  console.log('open http://localhost:8080');
  serve({
    fetch: app.fetch,
    port: 8080,
  });
})();
