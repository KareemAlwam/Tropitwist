# Tropitwist VPS Production Runbook

> Archived alternative deployment guide. The active Tropitwist staging setup is
> [Vercel Services](vercel-staging-deployment.md), not GitHub Pages.

Use this runbook only when deploying the Express API and PostgreSQL database to
one self-managed VPS. For the current Cloudflare Pages, Render, and Neon plan,
follow [Hosted Production Deployment](hosted-production-deployment.md).

## Prerequisites

- A Linux server with Docker Engine and Docker Compose v2.
- A public HTTPS API origin, for example `https://api.example.com`, routed to port `4000` through a reverse proxy.
- A GitHub Pages site at `https://kareemalwam.github.io/Tropitwist/`.
- DNS, TLS certificates, and firewall rules that permit HTTPS traffic to the API.
- A private server checkout of this repository and a safe location for database backups.

Do not commit `.env.production`, database dumps, or real secrets.

## Configure Environment

On the server, from the project root:

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Set every value in `.env.production`:

```dotenv
POSTGRES_PASSWORD=<long-url-safe-password>
FRONTEND_ORIGIN=https://kareemalwam.github.io
ADMIN_EMAILS=<comma-separated-admin-email-addresses>
JWT_ACCESS_SECRET=<random-secret-at-least-32-characters>
VITE_API_BASE_URL=https://api.example.com
```

`VITE_API_BASE_URL` is used by the frontend build, while the API container uses the other values. Use a URL-safe `POSTGRES_PASSWORD`, because Compose embeds it in `DATABASE_URL`.

## Deploy Or Update

Initial deployment and normal updates use the same commands:

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

View service logs when a container does not become healthy:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml logs --tail=200 api
docker compose --env-file .env.production -f docker-compose.production.yml logs --tail=200 database
```

## Configure GitHub Pages

In GitHub, open the repository settings, then **Secrets and variables** -> **Actions** -> **Variables**. Create or update the repository variable:

```text
VITE_API_BASE_URL=https://api.example.com
```

Push to `main` or manually run the **Deploy to GitHub Pages** workflow. The workflow passes this variable into the Vite build. Verify the deployed site calls the public API origin, not `localhost`.

## Health Check

Run this from a network that can reach the public API:

```bash
curl -fsS https://api.example.com/api/v1/health
```

It must return a successful JSON response. Also confirm the database container is healthy:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml ps
```

## Backup PostgreSQL

Create backups before every release and on a scheduled basis. The command writes a plain SQL dump to `backups/` on the server:

```bash
mkdir -p backups
docker compose --env-file .env.production -f docker-compose.production.yml exec -T database pg_dump -U tropitwist -d tropitwist > backups/tropitwist-$(date +%F-%H%M%S).sql
```

Copy backups off the server and periodically test a restore on a non-production database.

## Restore PostgreSQL

Restoring replaces the production database. Stop the API first and confirm the selected dump is correct:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml stop api
docker compose --env-file .env.production -f docker-compose.production.yml exec -T database dropdb -U tropitwist --force tropitwist
docker compose --env-file .env.production -f docker-compose.production.yml exec -T database createdb -U tropitwist tropitwist
docker compose --env-file .env.production -f docker-compose.production.yml exec -T database psql -U tropitwist -d tropitwist < backups/<backup-file>.sql
docker compose --env-file .env.production -f docker-compose.production.yml up -d api
```

Run the health check and smoke test after restoring.

## Rollback

1. Put the storefront into maintenance communication if customers could be affected.
2. Stop new API traffic at the reverse proxy, if available.
3. Back up the current database.
4. Check out the last known-good release commit or tag.
5. Rebuild and start the previous API image:

```bash
git checkout <known-good-commit-or-tag>
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

6. Restore the pre-release database backup only if the release changed data incompatibly.
7. Run the health check and smoke test before reopening traffic.

Return the server checkout to `main` before the next planned deployment.

## Production Smoke Test

- Load `https://kareemalwam.github.io/Tropitwist/` and confirm products load from the public API.
- Register a new customer and verify the account dashboard opens.
- Reload the dashboard; the customer should remain signed in through refresh-token rotation.
- Add an in-stock product to the cart and complete a cash-on-delivery checkout.
- Confirm the order appears in the customer dashboard and its total matches the cart.
- Sign in as an account listed in `ADMIN_EMAILS` and open the admin dashboard.
- Confirm the order appears, then update its status and verify the customer dashboard reflects it.
- Create or update an active product with positive inventory; verify it appears in the storefront.
- Sign out, reload, and confirm the account remains signed out.
- Confirm the health endpoint still succeeds and review API logs for unexpected errors.
