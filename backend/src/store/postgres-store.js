import pg from 'pg';
import { MemoryStore } from './memory-store.js';

const { Pool } = pg;

// A single durable JSONB document keeps the small-store adapter simple while the
// MemoryStore remains the domain model. Writes are serialized to avoid stale
// snapshots within one API process.
export class PostgresStore extends MemoryStore {
  constructor(connectionString) {
    super();
    this.pool = new Pool({ connectionString });
    this.writeQueue = Promise.resolve();
    this.ready = false;
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tropitwist_state (
        id SMALLINT PRIMARY KEY CHECK (id = 1),
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const result = await this.pool.query('SELECT data FROM tropitwist_state WHERE id = 1');
    if (result.rows[0]) this.hydrate(result.rows[0].data);
    else await this.writeSnapshot();
    this.ready = true;
    return this;
  }

  snapshot() {
    return {
      products: this.products, users: this.users, sessions: this.sessions,
      carts: [...this.carts], addresses: this.addresses, orders: this.orders,
      wishlists: [...this.wishlists], newsletter: [...this.newsletter],
    };
  }

  hydrate(data) {
    this.products = data.products || this.products;
    this.users = data.users || [];
    this.sessions = data.sessions || [];
    this.carts = new Map(data.carts || []);
    this.addresses = data.addresses || [];
    this.orders = data.orders || [];
    this.wishlists = new Map(data.wishlists || []);
    this.newsletter = new Set(data.newsletter || []);
  }

  writeSnapshot() {
    return this.pool.query(
      `INSERT INTO tropitwist_state (id, data) VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [JSON.stringify(this.snapshot())],
    );
  }

  persist() {
    if (!this.ready) return this.writeQueue;
    this.writeQueue = this.writeQueue.then(() => this.writeSnapshot());
    this.writeQueue.catch((error) => console.error('Failed to persist store state:', error));
    return this.writeQueue;
  }

  createUser(...args) { const value = super.createUser(...args); this.persist(); return value; }
  updateUser(...args) { const value = super.updateUser(...args); this.persist(); return value; }
  createSession(...args) { const value = super.createSession(...args); this.persist(); return value; }
  deleteSession(...args) { const value = super.deleteSession(...args); this.persist(); return value; }
  setCart(...args) { const value = super.setCart(...args); this.persist(); return value; }
  mergeCart(...args) { const value = super.mergeCart(...args); this.persist(); return value; }
  createAddress(...args) { const value = super.createAddress(...args); this.persist(); return value; }
  updateAddress(...args) { const value = super.updateAddress(...args); this.persist(); return value; }
  deleteAddress(...args) { const value = super.deleteAddress(...args); this.persist(); return value; }
  createOrder(...args) { const value = super.createOrder(...args); this.persist(); return value; }
  setWishlist(...args) { const value = super.setWishlist(...args); this.persist(); return value; }

  async close() {
    await this.writeQueue;
    await this.pool.end();
  }
}

export async function createStore(databaseUrl) {
  if (!databaseUrl) return new MemoryStore();
  return new PostgresStore(databaseUrl).init();
}
