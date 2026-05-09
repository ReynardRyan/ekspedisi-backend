# 📦 Ekspedisi — Backend API

Backend API untuk aplikasi layanan ekspedisi, dibangun menggunakan **NestJS** dengan **Prisma ORM** dan **MySQL** sebagai database utama.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | [NestJS](https://nestjs.com/) v11 |
| Language | TypeScript |
| ORM | [Prisma](https://www.prisma.io/) v6 |
| Database | MySQL 8.0 |
| Cache / Queue | Redis |
| Validation | [Zod](https://zod.dev/) |
| Auth | JWT (JSON Web Token) |
| Payment Gateway | Xendit |
| Geocoding | OpenCage API |
| Email | SMTP (Nodemailer) |
| Container | Docker & Docker Compose |

---

## 🗂️ Struktur Project

```
src/
├── common/
│   ├── interceptors/
│   │   └── response.interceptor.ts   # Global response transform
│   └── pipes/
│       └── zod.validation.pipe.ts    # Global Zod validation pipe
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts

prisma/
├── schema.prisma                     # Database schema & models
└── seeders/
    └── seed.ts                       # Database seeder
```

---

## 🗃️ Database Schema

Project ini menggunakan MySQL dengan model-model berikut:

| Model | Deskripsi |
|---|---|
| `User` | Data pengguna (customer & karyawan) |
| `Role` | Peran pengguna (admin, customer, courier, dll) |
| `Permission` | Hak akses per resource |
| `RolePermission` | Relasi many-to-many Role ↔ Permission |
| `Branch` | Cabang/kantor ekspedisi |
| `EmployeeBranch` | Penugasan karyawan ke cabang |
| `UserAddress` | Alamat pengiriman milik pengguna |
| `Shipment` | Data pengiriman utama |
| `ShipmentDetail` | Detail paket, penerima, dan harga pengiriman |
| `ShipmentHistory` | Riwayat status pengiriman |
| `ShipmentBranchLog` | Log scan paket di setiap cabang |
| `Payment` | Data transaksi pembayaran (via Xendit) |

---

## 🚀 Cara Menjalankan

### Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) & Docker Compose
- npm

---

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd backend
npm install
```

---

### 2. Konfigurasi Environment

Salin file `.env.example` menjadi `.env` dan isi sesuai konfigurasi lokal:

```bash
cp .env.example .env
```

Variabel yang perlu dikonfigurasi:

```env
# Database
DATABASE_URL=""

# App
PORT=

# JWT
JWT_SECRET_KEY=your_secret_key_here
JWT_EXPIRES_IN=1d

# Xendit (Payment Gateway)
XENDIT_SECRET_KEY=your_xendit_key

# OpenCage (Geocoding)
OPENCAGE_API_KEY=your_opencage_key

# SMTP (Email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL_SENDER=noreply@example.com
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password

# Redis
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=

# CORS
FRONTEND_URL=
```

---

### 3. Jalankan Database dengan Docker

```bash
docker-compose up -d
```

Layanan yang akan berjalan:

| Layanan | Port | URL |
|---|---|---|
| MySQL | `3306` | — |
| Redis | `6379` | — |
| phpMyAdmin | `8080` | http://localhost:8080 |

---

### 4. Migrasi & Seed Database

```bash
# Jalankan migrasi Prisma
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed data awal (opsional)
npm run seed
```

---

### 5. Jalankan Aplikasi

```bash
# Development (hot-reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

Aplikasi akan berjalan di: **http://localhost:3000**

---

## 📜 Scripts

| Script | Perintah | Keterangan |
|---|---|---|
| Start Dev | `npm run start:dev` | Jalankan dengan hot-reload |
| Start Prod | `npm run start:prod` | Jalankan production build |
| Build | `npm run build` | Compile TypeScript |
| Format | `npm run format` | Format kode dengan Prettier |
| Lint | `npm run lint` | Lint & auto-fix dengan ESLint |
| Test | `npm run test` | Jalankan unit test |
| Test Coverage | `npm run test:cov` | Jalankan test dengan coverage report |
| Test E2E | `npm run test:e2e` | Jalankan end-to-end test |
| Seed | `npm run seed` | Jalankan database seeder |

---

## 🗺️ Fitur Utama

- 🔐 **Autentikasi & Otorisasi** — JWT-based auth dengan sistem Role & Permission
- 📦 **Manajemen Pengiriman** — Buat, lacak, dan kelola status paket
- 📍 **Geocoding** — Kalkulasi jarak otomatis menggunakan OpenCage API
- 💳 **Pembayaran** — Integrasi Xendit untuk pembuatan invoice
- 📧 **Email Notifikasi** — Pengiriman struk/notifikasi via SMTP
- 🏢 **Multi-Cabang** — Manajemen cabang dan penugasan karyawan
- 📊 **Tracking QR Code** — Scan paket antar cabang dengan log detail
- ⚡ **Redis Caching** — Caching dan manajemen queue

---

## 🐳 Docker Services

```yaml
# Jalankan semua service
docker-compose up -d

# Stop semua service
docker-compose down

# Lihat logs
docker-compose logs -f
```
