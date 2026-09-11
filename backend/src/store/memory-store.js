import { randomUUID } from 'node:crypto';
import { seedProducts } from '../data/products.js';
import { hashToken } from '../lib/security.js';

const clone = (value) => structuredClone(value);

export class MemoryStore {
  constructor() {
    this.products = clone(seedProducts);
    this.users = [];
    this.sessions = [];
    this.carts = new Map();
    this.addresses = [];
    this.orders = [];
    this.wishlists = new Map();
    this.newsletter = new Set();
  }

  newId(prefix) { return `${prefix}_${randomUUID().replaceAll('-', '').slice(0, 16)}`; }

  publicUser(user) {
    if (!user) return null;
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return clone(safeUser);
  }

  findUserByEmail(email) { return this.users.find((user) => user.email === email.toLowerCase()); }
  findUser(id) { return this.users.find((user) => user.id === id); }
  createUser(input) {
    const now = new Date().toISOString();
    const user = { id: this.newId('usr'), ...input, email: input.email.toLowerCase(), role: 'customer', createdAt: now, updatedAt: now };
    this.users.push(user);
    return this.publicUser(user);
  }
  updateUser(id, input) {
    const user = this.findUser(id);
    Object.assign(user, input, { updatedAt: new Date().toISOString() });
    return this.publicUser(user);
  }
  createSession(userId, token, expiresAt) {
    this.sessions.push({ id: this.newId('ses'), userId, tokenHash: hashToken(token), expiresAt });
  }
  userForToken(token) {
    const session = this.sessions.find((item) => item.tokenHash === hashToken(token) && new Date(item.expiresAt) > new Date());
    return session ? this.publicUser(this.findUser(session.userId)) : null;
  }
  deleteSession(token) { this.sessions = this.sessions.filter((item) => item.tokenHash !== hashToken(token)); }

  getCart(owner) { return clone(this.carts.get(owner) || []); }
  setCart(owner, items) { this.carts.set(owner, clone(items)); return this.getCart(owner); }
  mergeCart(fromOwner, toOwner) {
    const merged = new Map(this.getCart(toOwner).map((item) => [item.productId, item.quantity]));
    for (const item of this.getCart(fromOwner)) merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
    this.carts.delete(fromOwner);
    return this.setCart(toOwner, [...merged].map(([productId, quantity]) => ({ productId, quantity })));
  }

  listAddresses(userId) { return clone(this.addresses.filter((item) => item.userId === userId)); }
  createAddress(userId, input) {
    const address = { id: this.newId('adr'), userId, ...input, createdAt: new Date().toISOString() };
    this.addresses.push(address); return clone(address);
  }
  updateAddress(userId, id, input) {
    const address = this.addresses.find((item) => item.id === id && item.userId === userId);
    if (!address) return null;
    Object.assign(address, input); return clone(address);
  }
  deleteAddress(userId, id) {
    const before = this.addresses.length;
    this.addresses = this.addresses.filter((item) => !(item.id === id && item.userId === userId));
    return before !== this.addresses.length;
  }

  createOrder(input) {
    const order = { id: this.newId('ord'), status: 'pending', ...clone(input), createdAt: new Date().toISOString() };
    this.orders.push(order); return clone(order);
  }
  listOrders(userId) { return clone(this.orders.filter((item) => item.userId === userId)); }
  findOrder(id) { const order = this.orders.find((item) => item.id === id); return order ? clone(order) : null; }

  getWishlist(userId) { return clone(this.wishlists.get(userId) || []); }
  setWishlist(userId, ids) { this.wishlists.set(userId, [...new Set(ids)]); return this.getWishlist(userId); }
}
