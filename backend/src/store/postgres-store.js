import pg from 'pg';
import { MemoryStore } from './memory-store.js';

const { Pool } = pg;
const iso = (value) => value instanceof Date ? value.toISOString() : value;

// The route layer keeps its synchronous store contract. PostgreSQL persists the
// same domain records into normalized tables in a transaction after each write.
export class PostgresStore extends MemoryStore {
  constructor(connectionString) {
    super();
    this.pool = new Pool({ connectionString });
    this.writeQueue = Promise.resolve();
    this.ready = false;
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, type TEXT NOT NULL, price INTEGER NOT NULL, compare_at_price INTEGER, size TEXT NOT NULL, inventory INTEGER NOT NULL, featured BOOLEAN NOT NULL, bestseller BOOLEAN NOT NULL, status TEXT NOT NULL, description TEXT NOT NULL, detail TEXT NOT NULL, image TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash TEXT UNIQUE NOT NULL, expires_at TIMESTAMPTZ NOT NULL);
      CREATE TABLE IF NOT EXISTS carts (owner TEXT NOT NULL, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE, quantity INTEGER NOT NULL CHECK (quantity > 0), PRIMARY KEY (owner, product_id));
      CREATE TABLE IF NOT EXISTS addresses (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, label TEXT NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, area TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL);
      CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), customer JSONB NOT NULL, payment_method TEXT NOT NULL, subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL, total INTEGER NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL);
      CREATE TABLE IF NOT EXISTS order_items (order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id TEXT NOT NULL, name TEXT NOT NULL, quantity INTEGER NOT NULL, unit_price INTEGER NOT NULL, line_total INTEGER NOT NULL, PRIMARY KEY (order_id, product_id));
      CREATE TABLE IF NOT EXISTS wishlists (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE, PRIMARY KEY (user_id, product_id));
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (email TEXT PRIMARY KEY);
    `);
    const result = await this.pool.query('SELECT COUNT(*)::int AS count FROM products');
    if (result.rows[0].count === 0) {
      const legacy = await this.pool.query('SELECT data FROM tropitwist_state WHERE id = 1').catch(() => null);
      if (legacy?.rows[0]) {
        this.hydrateLegacy(legacy.rows[0].data);
      }
      await this.writeSnapshot();
    } else await this.hydrate();
    this.ready = true;
    return this;
  }

  async hydrate() {
    const [products, users, sessions, carts, addresses, orders, orderItems, wishlists, newsletter] = await Promise.all([
      this.pool.query('SELECT * FROM products ORDER BY id'), this.pool.query('SELECT * FROM users ORDER BY id'), this.pool.query('SELECT * FROM sessions ORDER BY id'), this.pool.query('SELECT * FROM carts ORDER BY owner, product_id'), this.pool.query('SELECT * FROM addresses ORDER BY created_at'), this.pool.query('SELECT * FROM orders ORDER BY created_at'), this.pool.query('SELECT * FROM order_items ORDER BY order_id, product_id'), this.pool.query('SELECT * FROM wishlists ORDER BY user_id, product_id'), this.pool.query('SELECT * FROM newsletter_subscriptions ORDER BY email'),
    ]);
    this.products = products.rows.map((row) => ({ id: row.id, slug: row.slug, name: row.name, category: row.category, type: row.type, price: row.price, compareAtPrice: row.compare_at_price, size: row.size, inventory: row.inventory, featured: row.featured, bestseller: row.bestseller, status: row.status, description: row.description, detail: row.detail, image: row.image }));
    this.users = users.rows.map((row) => ({ id: row.id, firstName: row.first_name, lastName: row.last_name, email: row.email, passwordHash: row.password_hash, role: row.role, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at) }));
    this.sessions = sessions.rows.map((row) => ({ id: row.id, userId: row.user_id, tokenHash: row.token_hash, expiresAt: iso(row.expires_at) }));
    this.carts = new Map();
    for (const row of carts.rows) this.carts.set(row.owner, [...(this.carts.get(row.owner) || []), { productId: row.product_id, quantity: row.quantity }]);
    this.addresses = addresses.rows.map((row) => ({ id: row.id, userId: row.user_id, label: row.label, firstName: row.first_name, lastName: row.last_name, phone: row.phone, address: row.address, city: row.city, area: row.area, createdAt: iso(row.created_at) }));
    const itemsByOrder = new Map();
    for (const row of orderItems.rows) itemsByOrder.set(row.order_id, [...(itemsByOrder.get(row.order_id) || []), { productId: row.product_id, name: row.name, quantity: row.quantity, unitPrice: row.unit_price, lineTotal: row.line_total }]);
    this.orders = orders.rows.map((row) => ({ id: row.id, userId: row.user_id, customer: row.customer, paymentMethod: row.payment_method, subtotal: row.subtotal, shipping: row.shipping, total: row.total, currency: row.currency, status: row.status, createdAt: iso(row.created_at), items: itemsByOrder.get(row.id) || [] }));
    this.wishlists = new Map();
    for (const row of wishlists.rows) this.wishlists.set(row.user_id, [...(this.wishlists.get(row.user_id) || []), row.product_id]);
    this.newsletter = new Set(newsletter.rows.map((row) => row.email));
  }

  hydrateLegacy(data) {
    this.products = data.products || this.products;
    this.users = data.users || [];
    this.sessions = data.sessions || [];
    this.carts = new Map(data.carts || []);
    this.addresses = data.addresses || [];
    this.orders = data.orders || [];
    this.wishlists = new Map(data.wishlists || []);
    this.newsletter = new Set(data.newsletter || []);
  }

  async writeSnapshot() {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM order_items; DELETE FROM sessions; DELETE FROM carts; DELETE FROM addresses; DELETE FROM wishlists; DELETE FROM newsletter_subscriptions; DELETE FROM orders; DELETE FROM users; DELETE FROM products;');
      for (const product of this.products) await client.query('INSERT INTO products VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)', [product.id, product.slug, product.name, product.category, product.type, product.price, product.compareAtPrice ?? null, product.size, product.inventory, product.featured, product.bestseller, product.status, product.description, product.detail, product.image]);
      for (const user of this.users) await client.query('INSERT INTO users VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [user.id, user.firstName, user.lastName, user.email, user.passwordHash, user.role, user.createdAt, user.updatedAt]);
      for (const session of this.sessions) await client.query('INSERT INTO sessions VALUES ($1,$2,$3,$4)', [session.id, session.userId, session.tokenHash, session.expiresAt]);
      for (const [owner, items] of this.carts) for (const item of items) await client.query('INSERT INTO carts VALUES ($1,$2,$3)', [owner, item.productId, item.quantity]);
      for (const address of this.addresses) await client.query('INSERT INTO addresses VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [address.id, address.userId, address.label, address.firstName, address.lastName, address.phone, address.address, address.city, address.area, address.createdAt]);
      for (const order of this.orders) {
        await client.query('INSERT INTO orders VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [order.id, order.userId, JSON.stringify(order.customer), order.paymentMethod, order.subtotal, order.shipping, order.total, order.currency, order.status, order.createdAt]);
        for (const item of order.items) await client.query('INSERT INTO order_items VALUES ($1,$2,$3,$4,$5,$6)', [order.id, item.productId, item.name, item.quantity, item.unitPrice, item.lineTotal]);
      }
      for (const [userId, productIds] of this.wishlists) for (const productId of productIds) await client.query('INSERT INTO wishlists VALUES ($1,$2)', [userId, productId]);
      for (const email of this.newsletter) await client.query('INSERT INTO newsletter_subscriptions VALUES ($1)', [email]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
  }

  persist() {
    if (!this.ready) return this.writeQueue;
    this.writeQueue = this.writeQueue.then(() => this.writeSnapshot());
    this.writeQueue.catch((error) => console.error('Failed to persist store state:', error));
    return this.writeQueue;
  }

  async flush() { await this.writeQueue; }

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

  async close() { await this.writeQueue; await this.pool.end(); }
}

export async function createStore(databaseUrl) {
  if (!databaseUrl) return new MemoryStore();
  return new PostgresStore(databaseUrl).init();
}
