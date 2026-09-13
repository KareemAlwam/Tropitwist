# Tropitwist

A responsive skincare storefront built with React, Vite, and Tailwind CSS.

## Requirements

- Node.js 20 or newer
- npm

## Development

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5174`.

## Commands

- `npm run dev` starts the local development server.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.

## Project structure

```text
src/
├── components/
│   ├── catalog/   Reusable catalog composition and product cards
│   ├── layout/    Shared site chrome
│   ├── pages/     Route-level page components
│   ├── sections/  Homepage content sections
│   └── ui/        Reusable UI components
├── context/       Shared React state
├── constants/     Shared static options and domain constants
├── data/          Product and site content
├── features/      Isolated account, admin, checkout, and search domains
├── hooks/         Reusable stateful behavior
├── services/      Browser storage and future API boundaries
├── app/           Route registry and application layouts
├── utils/         Routing helpers
├── App.jsx        Page resolution and application shell
├── index.css      Tailwind layers and global styles
└── main.jsx       Application entry point
```

## Routing and deployment

Routes are resolved in `src/App.jsx`. The production workflow builds and deploys
the site to GitHub Pages under `/Tropitwist/`, including static fallbacks for all
current storefront routes.

Cart contents are stored locally in the browser under `tropitwist-cart`.

## Backend

The API lives in `backend/`. See [`backend/README.md`](backend/README.md) for its
setup, routes, authentication, and test commands.

## Production deployment

The recommended MVP deployment uses Cloudflare Pages for the React storefront,
Render for the Express API, and Neon for PostgreSQL. It starts with free tiers;
upgrade only the Render API when the storefront is ready for real visitors.

Follow [`docs/hosted-production-deployment.md`](docs/hosted-production-deployment.md).
It covers provider setup, environment variables, DNS, Paymob callbacks, and the
production smoke test. The Docker Compose configuration remains available for a
future single-VPS deployment.

GitHub Actions runs the frontend production build and backend API test suite on
pull requests and pushes to `main`.
