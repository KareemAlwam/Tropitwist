import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './lib/errors.js';
import { createApiRouter } from './routes/api.js';
import { MemoryStore } from './store/memory-store.js';

export function createApp({ store = new MemoryStore() } = {}) {
  const app = express();

  app.disable('x-powered-by');
  const origins = env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim());
  app.use(cors({ origin: origins, credentials: true, allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Id', 'X-Admin-Key'] }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/v1/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'tropitwist-api',
      database: store.constructor.name === 'MemoryStore' ? 'memory' : 'configured',
    });
  });

  const api = createApiRouter(store);
  app.use('/api/v1', api);
  app.use('/api', api);

  app.use((_request, response) => {
    response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } });
  });

  app.use(errorHandler);

  return app;
}
