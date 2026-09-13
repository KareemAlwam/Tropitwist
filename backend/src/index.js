import { createApp } from './app.js';
import { env } from './config/env.js';
import { createStore } from './store/postgres-store.js';

// Vercel imports this Express application instead of starting a persistent server.
const store = await createStore(env.DATABASE_URL);

export default createApp({ store });
