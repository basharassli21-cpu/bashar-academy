# Bashar Academy — Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- Cloudflare R2 bucket (for video uploads)
- Resend account (for emails)
- Google Cloud Console project (for Calendar API)

---

## 1. Environment Variables

```bash
# === Database (Neon) ===
DATABASE_URL="postgresql://user:password@host-pooler/dbname?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@host/dbname?sslmode=require"

# === Auth ===
JWT_SECRET="generate-with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
DEFAULT_COUNTRY_CODE="962"

# === Cloudflare R2 (Video Hosting) ===
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="bashar-academy-videos"
R2_PUBLIC_URL="https://pub-xxxx.r2.dev"

# === Resend (Email) ===
RESEND_API_KEY="re_..."

# === Google Calendar (Consultation Bookings) ===
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REFRESH_TOKEN=""
GOOGLE_CALENDAR_ID="primary"

# === Site URL ===
NEXT_PUBLIC_URL="https://bashar-academy.vercel.app"
```

## 2. Database Setup

```bash
# Deploy Prisma migrations
npx prisma migrate deploy

# Seed admin user (optional)
npx prisma db seed
```

## 3. Cloudflare R2 Setup

1. Create an R2 bucket named `bashar-academy-videos`
2. Generate R2 API token with read/write permissions
3. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` in env
4. (Optional) Set up a custom domain for public video delivery

## 4. Resend Setup

1. Create account at resend.com
2. Verify your domain
3. Create an API key with sending permission
4. Set `RESEND_API_KEY`

## 5. Google Calendar Setup

1. Go to Google Cloud Console → Create project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials (Desktop app type)
4. Get refresh token with `https://www.googleapis.com/auth/calendar` scope
5. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

## 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in Vercel Dashboard → Project Settings → Environment Variables.

## 7. Post-Deployment

1. Create admin user via seed or DB
2. Log in as admin at `/login`
3. Add categories at `/admin/academy/categories`
4. Create courses at `/admin/academy/courses`
5. Add consultation slots at `/admin/academy/bookings`
6. Write blog posts at `/admin/academy/blog`

## 8. Architecture Overview

```
Student Flow:
  /register → /academy → course → lesson (video/text/quiz) → certificate

Admin Flow:
  /login → /admin/academy → manage courses, lessons, students, bookings, blog

API Layer:
  /api/academy/* → Prisma → PostgreSQL
  Videos → Cloudflare R2 (signed URLs)
  Emails → Resend
  Calendar → Google Calendar API
```
