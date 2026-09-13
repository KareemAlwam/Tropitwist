# Tropitwist Vercel Staging

Deploy two Vercel projects from the same GitHub repository. This supports the
free staging phase. Vercel Hobby is not the final commercial hosting plan for a
store that accepts payments.

## API Project

1. In Vercel, import `KareemAlwam/Tropitwist` as a new project.
2. Set **Root Directory** to `backend`.
3. Leave framework detection enabled. Vercel uses `src/index.js` as the Express
   function entry point.
4. Add these production environment variables directly in Vercel:

```dotenv
NODE_ENV=production
DATABASE_URL=<Neon pooled connection string>
FRONTEND_ORIGIN=https://placeholder.invalid
ADMIN_EMAILS=<your email address>
JWT_ACCESS_SECRET=<a private random value of at least 32 characters>
```

5. Deploy and copy its `https://<api-project>.vercel.app` URL.

## Frontend Project

1. Import the same repository as a second Vercel project.
2. Keep **Root Directory** empty.
3. Set the framework to Vite if it is not detected automatically.
4. Add this production variable:

```dotenv
VITE_API_BASE_URL=https://<api-project>.vercel.app
```

5. Deploy and copy its `https://<storefront-project>.vercel.app` URL.

## Connect and Test

1. Update the API project's `FRONTEND_ORIGIN` to the exact frontend Vercel URL.
2. Redeploy the API project.
3. Open the frontend URL and test catalog, guest cart, account, COD checkout,
   order dashboard, and admin dashboard.

When the domain is ready, deploy the frontend at `tropitwist.store` and API at
`api.tropitwist.store`, then update `VITE_API_BASE_URL` and `FRONTEND_ORIGIN`.
Add Paymob variables only after the API has its custom HTTPS domain.
