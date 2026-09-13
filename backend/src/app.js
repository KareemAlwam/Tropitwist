import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './lib/errors.js';
import { createApiRouter } from './routes/api.js';
import { MemoryStore } from './store/memory-store.js';
import { createStore } from './store/postgres-store.js';

export function createApp({ store = new MemoryStore() } = {}) {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  const origins = env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim());
  app.use(cors({ origin: origins, credentials: true, allowedHeaders: ['Content-Type', 'Authorization', 'X-Cart-Id', 'X-CSRF-Token'], exposedHeaders: ['X-Request-Id'] }));
  app.use((request, response, next) => {
    const incomingRequestId = request.get('x-request-id');
    request.id = incomingRequestId && /^[A-Za-z0-9._-]{1,100}$/.test(incomingRequestId) ? incomingRequestId : randomUUID();
    response.set({
      'Cross-Origin-Resource-Policy': 'same-site',
      'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Request-Id': request.id,
    });
    if (env.NODE_ENV === 'production') response.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
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

let vercelApp;

export default async function vercelHandler(request, response) {
  vercelApp ||= createStore(env.DATABASE_URL).then((store) => createApp({ store }));
  return (await vercelApp)(request, response);
}
