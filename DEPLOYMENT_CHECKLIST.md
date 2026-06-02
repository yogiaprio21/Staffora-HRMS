# Staffora HRMS Deployment Checklist

## Neon

- Create a Neon Postgres project.
- Use the pooled connection string for `DATABASE_URL`.
- Use the direct connection string for `DIRECT_URL`.
- Keep `sslmode=require` in both URLs.

## Render Backend

- Root directory: `backend`.
- Build command: `npm ci && npm run build`.
- Pre-deploy command: `npm run prisma:migrate`.
- Start command: `npm start`.
- Health check path: `/api/v1/health`.
- Set env vars: `NODE_ENV`, `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`, `COOKIE_SECURE`.
- Remove stale Prisma override env vars such as `PRISMA_QUERY_ENGINE_LIBRARY` if they were added manually.
- Confirm `/api/v1/health` returns 200.
- Confirm `/api/v1/ready` returns 200 after database migration.

## Vercel Frontend

- Root directory: `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Set `VITE_API_BASE_URL` to the Render API URL ending in `/api/v1`.
- Keep `VITE_DEMO_MODE=false` unless deploying a disposable demo database.

## Smoke Test

- Login as HR.
- Confirm dashboard loads.
- Open Employees and verify table search/filter/pagination.
- Submit a leave request.
- Approve or reject a pending leave.
- Confirm notification and activity log entries appear.

## Local Commands

```bash
cd backend
npm run typecheck
npm test
npm run build
npx prisma validate
npm audit --omit=dev

cd ../frontend
npm run lint
npm run test
npm run build
npm audit --omit=dev
```

## Optional E2E

```bash
cd frontend
E2E_ENABLED=true E2E_BASE_URL=http://127.0.0.1:5173 npm run test:e2e
```
