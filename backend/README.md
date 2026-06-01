# Staffora HRMS Backend

Backend API untuk sistem HRMS berbasis Node.js, Express, Prisma, dan PostgreSQL.

## Fitur Utama
- Auth dengan JWT access/refresh token
- RBAC untuk SUPER_ADMIN, HR, EMPLOYEE
- Manajemen karyawan
- Pengajuan dan persetujuan cuti
- Dashboard statistik
- Ekspor laporan PDF dan Excel
- Dokumentasi API Swagger

## Prasyarat
- Node.js 20+
- PostgreSQL 15+

## Konfigurasi Environment
Buat file `.env` di root proyek:

```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/staffora_hrms
JWT_ACCESS_SECRET=dev_access_secret
JWT_REFRESH_SECRET=dev_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000
COOKIE_SECURE=false
COOKIE_DOMAIN=
```

## Instalasi
```
npm install
```

## Migrasi & Generate Prisma
```
npm run prisma:generate
npm run prisma:push
```

## Menjalankan Server
```
npm run dev
```

Server berjalan di `http://localhost:4000`.

## Dokumentasi API
Swagger UI tersedia di:
```
http://localhost:4000/api/v1/docs
```

## Seed Data
Jalankan seed untuk mengisi data awal:
```
npm run seed
```

### Akun Awal
Semua akun menggunakan password: `Password123!`

- SUPER_ADMIN: admin@staffora.local
- HR: hr@staffora.local
- EMPLOYEE: emma@staffora.local
- EMPLOYEE: liam@staffora.local
- EMPLOYEE: sophia@staffora.local

## Skrip Penting
- `npm run dev` Menjalankan server development
- `npm run build` Build produksi
- `npm run start` Menjalankan hasil build
- `npm run typecheck` Type checking
- `npm test` Menjalankan test
- `npm run seed` Seed database
