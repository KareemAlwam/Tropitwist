import { createApp } from './app.js';
import { env } from './config/env.js';
import { createStore } from './store/postgres-store.js';
import { MemoryStore } from './store/memory-store.js';

let store;
try {
  store = await createStore(env.DATABASE_URL);
} catch (error) {
  if (env.NODE_ENV === 'production') throw error;
  console.warn(`PostgreSQL is unavailable (${error.code || 'connection error'}); using temporary in-memory storage.`);
  store = new MemoryStore();
}
const app = createApp({ store });

const server = app.listen(env.PORT, () => {
  console.info(`Tropitwist API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.info(`${signal} received; shutting down.`);
  server.close(async () => {
    await store.close?.();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
