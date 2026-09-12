import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ApiError, asyncRoute } from '../lib/errors.js';
import { createToken, hashPassword, verifyPassword } from '../lib/security.js';

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(8).max(128);
const id = z.string().min(1).max(100);
const addressSchema = z.object({
  firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(8).max(30), address: z.string().trim().min(4).max(250),
  city: z.string().trim().min(1).max(100), area: z.string().trim().min(1).max(100),
  label: z.string().trim().max(40).default('Home'),
});
const itemSchema = z.object({ productId: id, quantity: z.coerce.number().int().min(1).max(20) });
const customerSchema = addressSchema.omit({ label: true }).extend({
  email, notes: z.string().trim().max(500).optional().default(''),
});

function bearerToken(request) {
  const [kind, token] = String(request.headers.authorization || '').split(' ');
  return kind?.toLowerCase() === 'bearer' && token ? token : null;
}

function optionalUser(store) {
  return (request, _response, next) => {
    const token = bearerToken(request);
    request.authToken = token;
    request.user = token ? store.userForToken(token) : null;
    next();
  };
}

function requireUser(request, _response, next) {
  if (!request.user) return next(new ApiError(401, 'UNAUTHORIZED', 'Sign in to continue.'));
  next();
}

function requireAdmin(request, _response, next) {
  if (request.user?.role !== 'admin') {
    return next(new ApiError(403, 'FORBIDDEN', 'Admin access is required.'));
  }
  next();
}

function cartOwner(request) {
  if (request.user) return `user:${request.user.id}`;
  const guestId = request.get('x-cart-id');
  if (!guestId || !/^[A-Za-z0-9_-]{8,100}$/.test(guestId)) {
    throw new ApiError(400, 'CART_ID_REQUIRED', 'Send an X-Cart-Id header for a guest cart.');
  }
  return `guest:${guestId}`;
}

function publicProduct(product) {
  const { inventory, ...result } = product;
  return { ...result, available: product.status === 'active' && inventory > 0, inventory };
}

function expandedCart(store, owner) {
  const items = store.getCart(owner).flatMap((item) => {
    const product = store.products.find((candidate) => candidate.id === item.productId && candidate.status === 'active');
    return product ? [{ id: item.productId, product: publicProduct(product), quantity: item.quantity, lineTotal: product.price * item.quantity }] : [];
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotal };
}

function calculateTotals(subtotal) {
  const shipping = subtotal === 0 || subtotal >= 750 ? 0 : 60;
  return { subtotal, shipping, total: subtotal + shipping, currency: 'EGP' };
}

function validateInventory(store, items) {
  return items.map((item) => {
    const product = store.products.find((candidate) => candidate.id === item.productId && candidate.status === 'active');
    if (!product) throw new ApiError(422, 'PRODUCT_UNAVAILABLE', `Product ${item.productId} is unavailable.`);
    if (product.inventory < item.quantity) throw new ApiError(409, 'INSUFFICIENT_STOCK', `Only ${product.inventory} of ${product.name} are available.`);
    return { product, quantity: item.quantity, unitPrice: product.price, lineTotal: product.price * item.quantity };
  });
}

export function createApiRouter(store) {
  const router = Router();
  router.use(optionalUser(store));

  router.get('/products', (request, response) => {
    const query = z.object({
      category: z.string().trim().optional(), search: z.string().trim().optional(),
      sort: z.enum(['featured', 'price-low', 'price-high', 'newest']).default('featured'),
      page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20),
      availability: z.enum(['all', 'in-stock']).default('in-stock'),
    }).parse(request.query);
    let products = store.products.filter((product) => product.status === 'active');
    if (query.category) products = products.filter((product) => product.category === query.category);
    if (query.search) {
      const needle = query.search.toLowerCase();
      products = products.filter((product) => `${product.name} ${product.description} ${product.category} ${product.type}`.toLowerCase().includes(needle));
    }
    if (query.availability === 'in-stock') products = products.filter((product) => product.inventory > 0);
    products.sort((a, b) => query.sort === 'price-low' ? a.price - b.price : query.sort === 'price-high' ? b.price - a.price : Number(b.featured) - Number(a.featured));
    const total = products.length;
    const start = (query.page - 1) * query.limit;
    response.json({ data: products.slice(start, start + query.limit).map(publicProduct), pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } });
  });

  router.get('/products/:identifier', (request, response, next) => {
    const product = store.products.find((item) => item.id === request.params.identifier || item.slug === request.params.identifier);
    if (!product || product.status !== 'active') return next(new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found.'));
    response.json({ data: publicProduct(product) });
  });

  router.post('/auth/register', asyncRoute(async (request, response) => {
    const input = z.object({ firstName: z.string().trim().min(1).max(80), lastName: z.string().trim().min(1).max(80), email, password }).parse(request.body);
    if (store.findUserByEmail(input.email)) throw new ApiError(409, 'EMAIL_IN_USE', 'An account already exists for this email.');
    const { password: rawPassword, ...profile } = input;
    const adminEmails = env.ADMIN_EMAILS.split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
    const user = store.createUser({ ...profile, role: adminEmails.includes(profile.email) ? 'admin' : 'customer', passwordHash: hashPassword(rawPassword) });
    const token = createToken();
    const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 86400000).toISOString();
    store.createSession(user.id, token, expiresAt);
    response.status(201).json({ data: { user, token, expiresAt } });
  }));

  router.post('/auth/login', asyncRoute(async (request, response) => {
    const input = z.object({ email, password }).parse(request.body);
    const record = store.findUserByEmail(input.email);
    if (!record || !verifyPassword(input.password, record.passwordHash)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    const token = createToken();
    const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 86400000).toISOString();
    store.createSession(record.id, token, expiresAt);
    if (request.get('x-cart-id')) store.mergeCart(`guest:${request.get('x-cart-id')}`, `user:${record.id}`);
    response.json({ data: { user: store.publicUser(record), token, expiresAt } });
  }));

  router.post('/auth/logout', requireUser, (request, response) => { store.deleteSession(request.authToken); response.status(204).end(); });
  router.get('/me', requireUser, (request, response) => response.json({ data: request.user }));
  router.patch('/me', requireUser, (request, response) => {
    const input = z.object({ firstName: z.string().trim().min(1).max(80).optional(), lastName: z.string().trim().min(1).max(80).optional() }).parse(request.body);
    response.json({ data: store.updateUser(request.user.id, input) });
  });

  router.get('/addresses', requireUser, (request, response) => response.json({ data: store.listAddresses(request.user.id) }));
  router.post('/addresses', requireUser, (request, response) => response.status(201).json({ data: store.createAddress(request.user.id, addressSchema.parse(request.body)) }));
  router.patch('/addresses/:id', requireUser, (request, response, next) => {
    const updated = store.updateAddress(request.user.id, request.params.id, addressSchema.partial().parse(request.body));
    if (!updated) return next(new ApiError(404, 'ADDRESS_NOT_FOUND', 'Address not found.'));
    response.json({ data: updated });
  });
  router.delete('/addresses/:id', requireUser, (request, response, next) => {
    if (!store.deleteAddress(request.user.id, request.params.id)) return next(new ApiError(404, 'ADDRESS_NOT_FOUND', 'Address not found.'));
    response.status(204).end();
  });

  router.get('/cart', (request, response) => response.json({ data: expandedCart(store, cartOwner(request)) }));
  router.post('/cart/items', (request, response) => {
    const input = itemSchema.parse(request.body); const owner = cartOwner(request);
    const product = store.products.find((item) => item.id === input.productId && item.status === 'active');
    if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    const items = store.getCart(owner); const existing = items.find((item) => item.productId === input.productId);
    const quantity = (existing?.quantity || 0) + input.quantity;
    if (quantity > product.inventory) throw new ApiError(409, 'INSUFFICIENT_STOCK', `Only ${product.inventory} items are available.`);
    if (existing) existing.quantity = quantity; else items.push(input);
    store.setCart(owner, items); response.status(201).json({ data: expandedCart(store, owner) });
  });
  router.patch('/cart/items/:productId', (request, response) => {
    const quantity = z.object({ quantity: z.coerce.number().int().min(1).max(20) }).parse(request.body).quantity;
    const owner = cartOwner(request); const items = store.getCart(owner); const item = items.find((candidate) => candidate.productId === request.params.productId);
    if (!item) throw new ApiError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
    validateInventory(store, [{ productId: item.productId, quantity }]); item.quantity = quantity; store.setCart(owner, items);
    response.json({ data: expandedCart(store, owner) });
  });
  router.delete('/cart/items/:productId', (request, response) => {
    const owner = cartOwner(request); const items = store.getCart(owner); const filtered = items.filter((item) => item.productId !== request.params.productId);
    if (items.length === filtered.length) throw new ApiError(404, 'CART_ITEM_NOT_FOUND', 'Cart item not found.');
    store.setCart(owner, filtered); response.status(204).end();
  });

  router.post('/checkout/session', requireUser, (request, response) => {
    const input = z.object({ items: z.array(itemSchema).min(1) }).parse(request.body);
    const lines = validateInventory(store, input.items); const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    response.json({ data: { items: lines.map(({ product, quantity, unitPrice, lineTotal }) => ({ productId: product.id, name: product.name, quantity, unitPrice, lineTotal })), ...calculateTotals(subtotal), paymentMethods: ['cash-on-delivery'] } });
  });

  router.post('/orders', requireUser, asyncRoute(async (request, response) => {
    const input = z.object({ customer: customerSchema, paymentMethod: z.enum(['cash-on-delivery']), items: z.array(itemSchema).min(1).max(50) }).parse(request.body);
    const owner = cartOwner(request);
    const lines = validateInventory(store, input.items); const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const totals = calculateTotals(subtotal);
    for (const line of lines) line.product.inventory -= line.quantity;
    const order = store.createOrder({ userId: request.user.id, customer: { ...input.customer, email: request.user.email }, paymentMethod: input.paymentMethod, items: lines.map(({ product, quantity, unitPrice, lineTotal }) => ({ productId: product.id, name: product.name, quantity, unitPrice, lineTotal })), ...totals });
    store.setCart(owner, []);
    await store.flush?.();
    response.status(201).json({ data: order });
  }));
  router.get('/orders', requireUser, (request, response) => response.json({ data: store.listOrders(request.user.id) }));
  router.get('/orders/:id', requireUser, (request, response) => {
    const order = store.findOrder(request.params.id);
    if (!order || order.userId !== request.user.id) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found.');
    response.json({ data: order });
  });

  router.get('/wishlist', requireUser, (request, response) => response.json({ data: store.getWishlist(request.user.id).flatMap((productId) => {
    const product = store.products.find((item) => item.id === productId && item.status === 'active');
    return product ? [publicProduct(product)] : [];
  }) }));
  router.post('/wishlist/items', requireUser, (request, response) => {
    const productId = z.object({ productId: id }).parse(request.body).productId;
    if (!store.products.some((product) => product.id === productId && product.status === 'active')) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    store.setWishlist(request.user.id, [...store.getWishlist(request.user.id), productId]); response.status(201).json({ data: { productId } });
  });
  router.delete('/wishlist/items/:productId', requireUser, (request, response) => { store.setWishlist(request.user.id, store.getWishlist(request.user.id).filter((item) => item !== request.params.productId)); response.status(204).end(); });

  router.post('/newsletter/subscriptions', (request, response) => {
    const subscriber = z.object({ email }).parse(request.body).email; const existed = store.newsletter.has(subscriber);
    store.newsletter.add(subscriber); store.persist?.(); response.status(existed ? 200 : 201).json({ data: { email: subscriber, subscribed: true } });
  });

  router.get('/admin/dashboard', requireAdmin, (request, response) => response.json(adminDashboard(store)));
  router.get('/admin/products', requireAdmin, (_request, response) => response.json({ data: store.products.map(publicProduct) }));
  router.post('/admin/products', requireAdmin, (request, response) => {
    const input = productSchema().parse(request.body);
    if (store.products.some((product) => product.slug === input.slug)) throw new ApiError(409, 'SLUG_IN_USE', 'Product slug already exists.');
    const product = { id: store.newId('prd'), ...input }; store.products.push(product); store.persist?.(); response.status(201).json({ data: publicProduct(product) });
  });
  router.patch('/admin/products/:id', requireAdmin, (request, response) => {
    const product = store.products.find((item) => item.id === request.params.id); if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
    Object.assign(product, productSchema().partial().parse(request.body)); store.persist?.(); response.json({ data: publicProduct(product) });
  });
  router.patch('/admin/orders/:id', requireAdmin, (request, response) => {
    const order = store.orders.find((item) => item.id === request.params.id); if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'Order not found.');
    order.status = z.object({ status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']) }).parse(request.body).status; store.persist?.(); response.json({ data: order });
  });
  router.get('/admin/customers', requireAdmin, (_request, response) => response.json({ data: store.users.map((user) => store.publicUser(user)) }));

  return router;
}

function productSchema() {
  return z.object({
    slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), name: z.string().trim().min(2).max(150),
    category: z.enum(['skincare', 'body', 'bundles']), type: z.string().trim().min(1).max(80),
    price: z.coerce.number().int().nonnegative(), compareAtPrice: z.coerce.number().int().nonnegative().optional(),
    size: z.string().trim().max(40).default('N/A'), inventory: z.coerce.number().int().nonnegative().default(0),
    featured: z.boolean().default(false), bestseller: z.boolean().default(false), status: z.enum(['active', 'draft']).default('active'),
    description: z.string().trim().min(1).max(500), detail: z.string().trim().max(2000).default(''), image: z.string().url(),
  });
}

export function adminDashboard(store) {
  const revenue = store.orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + order.total, 0);
  return {
    admin: { name: 'Store admin' },
    metrics: [
      { key: 'revenue', label: 'Revenue', value: `LE ${revenue}`, change: 'All-time sales' },
      { key: 'orders', label: 'Orders', value: store.orders.length, change: 'All orders' },
      { key: 'products', label: 'Products', value: store.products.length, change: `${store.products.filter((item) => item.status === 'active').length} active` },
      { key: 'customers', label: 'Customers', value: store.users.length, change: 'Registered accounts' },
    ],
    orders: store.orders.slice(-10).reverse().map((order) => ({ id: order.id, customer: `${order.customer.firstName} ${order.customer.lastName}`, date: order.createdAt.slice(0, 10), total: `LE ${order.total}`, status: order.status })),
    products: store.products.map((product) => ({ id: product.id, name: product.name, category: product.category, size: product.size, price: `LE ${product.price}`, inventory: product.inventory, status: product.status })),
    customers: store.users.map((user) => ({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email })),
    chart: { label: 'STORE ACTIVITY', headline: `${store.orders.length} orders`, values: [0, 0, 0, 0, 0, 0, Math.min(100, store.orders.length * 10)] },
  };
}
