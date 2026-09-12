import { createApp } from './app.js';
import { env } from './config/env.js';
import { createStore } from './store/postgres-store.js';

async function main() {
  const store = await createStore(env.DATABASE_URL);
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
}

main().catch((error) => {
  console.error(`Unable to start Tropitwist API: ${error.code || error.message}. Check DATABASE_URL and PostgreSQL.`);
  process.exitCode = 1;
});
