# Tropitwist Vercel Staging

Deploy the frontend and API as Vercel Services from one GitHub project. The
frontend serves `/` and Express serves `/api`, so account cookies stay on one
origin. This supports the free staging phase. Vercel Hobby is not the final
commercial hosting plan for a store that accepts payments.

## Create the Project

1. In Vercel, import `KareemAlwam/Tropitwist` as a new project.
2. Leave **Root Directory** as the repository root and select the **Services**
   framework preset.
3. Vercel reads `vercel.json` and detects Vite at `/` and Express at `/api`.
4. Add these production environment variables directly in Vercel:

```dotenv
NODE_ENV=production
DATABASE_URL=<Neon pooled connection string>
FRONTEND_ORIGIN=https://placeholder.invalid
ADMIN_EMAILS=<your email address>
JWT_ACCESS_SECRET=<a private random value of at least 32 characters>
```

`VITE_API_BASE_URL` is not needed: the browser calls the API on the same Vercel
origin at `/api`.

## Connect and Test

1. Deploy, then open the single `https://<project>.vercel.app` URL.
2. Update `FRONTEND_ORIGIN` to that exact Vercel URL and redeploy.
3. Test catalog, guest cart, account, COD checkout,
   order dashboard, and admin dashboard.

When the domain is ready, point `tropitwist.store` to this Vercel project and
update `FRONTEND_ORIGIN`. Add Paymob variables only after the custom HTTPS domain
is active.
