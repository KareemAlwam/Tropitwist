# Tropitwist API

Express API for the Tropitwist storefront. It provides the catalog, authentication,
customer profiles and addresses, carts, checkout quotes, orders, wishlists,
newsletter subscriptions, and administration data.

## Run locally

```bash
cp .env.example .env
npm install
npm test
npm run dev
```

The API listens on `http://localhost:4000`. With `DATABASE_URL` configured it
persists its state in PostgreSQL; without it, data is held in memory and resets
when the process restarts. Development also falls back to memory if PostgreSQL is
offline; production fails startup instead. Set `ADMIN_API_KEY` and send
it as `X-Admin-Key` to protect admin routes. When the key is omitted, admin routes
remain open for the local storefront preview.

## HTTP API

All primary routes are available below `/api/v1`. `/api` is also mounted as a
compatibility prefix for the current frontend admin screen.

- `GET /products`, `GET /products/:id-or-slug`
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET /me`, `PATCH /me`
- `GET|POST /addresses`, `PATCH|DELETE /addresses/:id`
- `GET /cart`, `POST /cart/items`, `PATCH|DELETE /cart/items/:productId`
- `POST /checkout/session`
- `POST /orders`, `GET /orders`, `GET /orders/:id`
- `GET /wishlist`, `POST /wishlist/items`, `DELETE /wishlist/items/:productId`
- `POST /newsletter/subscriptions`
- `GET /admin/dashboard`, `GET|POST /admin/products`, `PATCH /admin/products/:id`
- `PATCH /admin/orders/:id`, `GET /admin/customers`

Authenticated requests use `Authorization: Bearer <token>`. Guest carts use a
stable random `X-Cart-Id` header. Prices, delivery charges, and availability are
always recalculated by the server. Raw card details are never accepted; only cash
on delivery is enabled until a hosted payment-provider flow is configured.

Errors consistently use:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```
