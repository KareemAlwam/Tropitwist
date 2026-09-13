# Tropitwist API

Express API for the Tropitwist storefront. It provides the catalog, authentication,
customer profiles and addresses, carts, checkout quotes, orders, wishlists,
newsletter subscriptions, and administration data.

## Run locally

```bash
cp .env.example .env
npm install
npm test
npm start
```

The API listens on `http://localhost:4000`. With `DATABASE_URL` configured it
persists products, accounts, carts, orders, addresses, wishlists, and newsletter
subscriptions in PostgreSQL tables. Without it, data is held in memory and resets
when the process restarts. A configured but unavailable PostgreSQL server prevents
startup to avoid accepting orders that would be lost. Admin routes require an
authenticated account whose email is listed in `ADMIN_EMAILS`.

On startup, the API applies its versioned schema migrations and records each one
in PostgreSQL's `schema_migrations` table. Normal requests write only the records
that changed; checkout updates inventory, the order, and its line items in one
database transaction. The legacy full-state snapshot is used only to import an
existing local `tropitwist_state` database on first startup.

## HTTP API

All primary routes are available below `/api/v1`. `/api` is also mounted as a
compatibility prefix for the current frontend admin screen.

- `GET /products`, `GET /products/:id-or-slug`
- `POST /auth/register`, `POST /auth/login`, `GET /auth/csrf`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /me`, `PATCH /me`
- `GET|POST /addresses`, `PATCH|DELETE /addresses/:id`
- `GET|PUT /cart`, `POST /cart/items`, `PATCH|DELETE /cart/items/:productId`
- `POST /checkout/session`
- `POST /orders`, `GET /orders`, `GET /orders/:id`
- `GET /payments/methods`, `POST /payments/paymob/checkout`, `POST /payments/paymob/webhook`
- `GET /wishlist`, `POST /wishlist/items`, `DELETE /wishlist/items/:productId`
- `POST /newsletter/subscriptions`
- `GET /admin/dashboard`, `GET|POST /admin/products`, `PATCH /admin/products/:id`
- `PATCH /admin/orders/:id`, `GET /admin/customers`

Authenticated requests use a short-lived JWT in `Authorization: Bearer <token>`.
The refresh token is rotated on every refresh and stored only as a hash in the
database; it is sent to browsers as an `HttpOnly` cookie. Guest carts use a stable
random `X-Cart-Id` header. Checkout quotes and order creation require an
authenticated account. Prices, delivery charges, and availability are always
recalculated by the server. Raw card details are never accepted; only cash on
delivery is enabled by default. Paymob card checkout becomes available only when
the Paymob environment variables are configured.

## Paymob Card Payments

Tropitwist uses Paymob Unified Checkout, so card details are captured on Paymob's
hosted checkout page and never reach this API. Create a Paymob merchant account,
complete its business verification, then set these private server variables:

```dotenv
PAYMOB_SECRET_KEY=sk_test_or_live_value
PAYMOB_PUBLIC_KEY=pk_test_or_live_value
PAYMOB_CARD_INTEGRATION_ID=123456
PAYMOB_HMAC_SECRET=callback_hmac_secret
PAYMOB_WEBHOOK_URL=https://api.example.com/api/v1/payments/paymob/webhook
PAYMOB_REDIRECT_URL=https://example.com/checkout
```

Use all test credentials first. Set the Paymob callback to the webhook URL, then
make a test payment after the API is reachable through HTTPS. The callback HMAC
and the server-calculated order amount are verified before an order is marked paid.

`POST /auth/refresh` and `POST /auth/logout` require an `X-CSRF-Token` header.
The frontend receives a fresh token at login/registration or from `GET /auth/csrf`.
Authentication routes are rate limited, and the API sends baseline security headers
on every response.

## Production container

For the recommended Cloudflare Pages, Render, and Neon MVP deployment, follow
[`../docs/hosted-production-deployment.md`](../docs/hosted-production-deployment.md).
The Docker setup below is an alternative for a single VPS.

`../docker-compose.production.yml` starts PostgreSQL and the API together. Copy
`../.env.production.example` to `.env.production`, replace every placeholder, then
run this from the project root:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

Use a URL-safe PostgreSQL password because it becomes part of `DATABASE_URL`.
The API health check is available at `/api/v1/health`. In production,
`JWT_ACCESS_SECRET`, `DATABASE_URL`, and `ADMIN_EMAILS` are mandatory.

Errors consistently use:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```
