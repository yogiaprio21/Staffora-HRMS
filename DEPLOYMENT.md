# Staffora HRMS Deployment

## Backend - Render

Use `backend` as the service root.

Build command:

```bash
npm ci && npm run build
```

Pre-deploy command:

```bash
npm run prisma:migrate
```

Start command:

```bash
npm start
```

Required environment variables are listed in `backend/.env.example`.

Use `DATABASE_URL` for the pooled Neon runtime connection and `DIRECT_URL` for the direct Neon migration connection.

The repository also includes `render.yaml` with:

- service root: `backend`
- health check: `/api/v1/health`
- production build: `npm ci && npm run build`
- production migration: `npm run prisma:migrate`

If you deploy the backend as a Docker service, keep using the included Dockerfile. It uses Debian Bookworm with OpenSSL installed so Prisma can load the correct query engine on Render. Remove any manually configured `PRISMA_QUERY_ENGINE_LIBRARY` from Render because it can force the wrong Prisma binary.

## Database - Neon

1. Create a Neon Postgres database.
2. Copy the pooled connection string into `DATABASE_URL`.
3. Copy the direct connection string into `DIRECT_URL`.
4. Keep `sslmode=require` in both URLs.
5. Run Render deploy; `npm run prisma:migrate` applies `backend/prisma/migrations`.
6. Run `npm run seed` only once for a demo database that can be reset. Do not add seed to automatic production deploy because it clears existing data before inserting demo data.

## Frontend - Vercel

Use `frontend` as the project root.

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

Required environment variables are listed in `frontend/.env.example`.

Set `VITE_API_BASE_URL` to the Render API URL, including `/api/v1`.
Keep `VITE_DEMO_MODE=false` for a real production deployment.

## Final Checklist

See `DEPLOYMENT_CHECKLIST.md`.
