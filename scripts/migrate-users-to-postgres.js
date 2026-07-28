// scripts/migrate-users-to-postgres.js
// Moves student/admin data from Vercel Blob → Neon Postgres permanently.
// Safe to run multiple times (ON CONFLICT DO NOTHING).
// Run: node scripts/migrate-users-to-postgres.js

import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

function loadEnv(path) {
  const raw = readFileSync(path, 'utf8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
loadEnv('.env.local')

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

// ── 1. Create table ────────────────────────────────────────────────────────
async function createTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_users (
      username            TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      avatar              TEXT,
      role                TEXT NOT NULL DEFAULT 'student',
      password_hash       TEXT NOT NULL,
      photo               TEXT,
      phone               TEXT,
      gender              TEXT,
      allowed_course      TEXT,
      subscription_type   TEXT DEFAULT 'permanent',
      subscription_expiry DATE,
      progress            JSONB DEFAULT '{}',
      quiz_scores         JSONB DEFAULT '{}',
      notes               JSONB DEFAULT '{}',
      soft_deleted        BOOLEAN DEFAULT false,
      soft_deleted_at     TIMESTAMPTZ,
      password_changed_at TIMESTAMPTZ,
      joined_at           DATE,
      last_login_at       TIMESTAMPTZ,
      last_active_at      TIMESTAMPTZ,
      created_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role)`
  console.log('✅ Table app_users ready')
}

// ── 2. Try to read existing users from Blob ────────────────────────────────
async function readFromBlob() {
  const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
  if (!TOKEN) { console.log('⚠️  No BLOB token — skipping Blob import'); return null }

  // Try direct URL (from head() call)
  const BLOB_URL = 'https://68vr2svmorkhd6bj.private.blob.vercel-storage.com/cba-users-v3.json'
  try {
    const r = await fetch(BLOB_URL, { headers: { Authorization: `Bearer ${TOKEN}` } })
    if (!r.ok) { console.log(`⚠️  Blob read failed: ${r.status} ${await r.text()}`); return null }
    const data = await r.json()
    console.log(`📦 Read ${Object.keys(data).length} users from Blob`)
    return data
  } catch(e) {
    console.log('⚠️  Blob unreachable:', e.message)
    return null
  }
}

// ── 3. Insert user row ─────────────────────────────────────────────────────
async function insertUser(username, u) {
  await sql`
    INSERT INTO app_users (
      username, name, avatar, role, password_hash, photo, phone, gender,
      allowed_course, subscription_type, subscription_expiry,
      progress, quiz_scores, notes,
      soft_deleted, soft_deleted_at, password_changed_at,
      joined_at, last_login_at, last_active_at
    ) VALUES (
      ${username},
      ${u.name || username},
      ${u.avatar || null},
      ${u.role || 'student'},
      ${u.passwordHash || ''},
      ${u.photo || null},
      ${u.phone || null},
      ${u.gender || null},
      ${u.allowedCourse || null},
      ${u.subscriptionType || 'permanent'},
      ${u.subscriptionExpiry || null},
      ${JSON.stringify(u.progress || {})},
      ${JSON.stringify(u.quizScores || {})},
      ${JSON.stringify(u.notes || {})},
      ${u.softDeleted || false},
      ${u.softDeletedAt || null},
      ${u.passwordChangedAt || null},
      ${u.joinedAt || null},
      ${u.lastLoginAt || null},
      ${u.lastActiveAt || null}
    )
    ON CONFLICT (username) DO UPDATE SET
      name                = EXCLUDED.name,
      avatar              = EXCLUDED.avatar,
      role                = EXCLUDED.role,
      password_hash       = EXCLUDED.password_hash,
      photo               = EXCLUDED.photo,
      phone               = EXCLUDED.phone,
      gender              = EXCLUDED.gender,
      allowed_course      = EXCLUDED.allowed_course,
      subscription_type   = EXCLUDED.subscription_type,
      subscription_expiry = EXCLUDED.subscription_expiry,
      progress            = EXCLUDED.progress,
      quiz_scores         = EXCLUDED.quiz_scores,
      notes               = EXCLUDED.notes,
      soft_deleted        = EXCLUDED.soft_deleted,
      soft_deleted_at     = EXCLUDED.soft_deleted_at,
      password_changed_at = EXCLUDED.password_changed_at,
      joined_at           = EXCLUDED.joined_at,
      last_login_at       = EXCLUDED.last_login_at,
      last_active_at      = EXCLUDED.last_active_at
  `
}

// ── 4. Seed fallback (only if Blob unavailable) ────────────────────────────
const SEED = {
  "student1": { name:"أحمد الخالد", avatar:"أخ", role:"student", passwordHash:"$2a$10$dog035qIUMHO6IltcppIUOAW.EbpFLZ3rm.9aXgV/NQInfb8FXXU.", progress:{}, quizScores:{}, allowedCourse:"elite", joinedAt:"2024-01-15" },
  "sarah":    { name:"سارة المنصور", avatar:"سم", role:"student", passwordHash:"$2a$10$qx1i7.RvXrYNAdSQT8Z0MOT7qCUn9B2ZscPCTUw/ZBcnHWLRtwOXm", progress:{}, quizScores:{}, allowedCourse:"professional", joinedAt:"2024-01-20" },
  "bashar":   { name:"بشار العسلي", avatar:"بع", role:"admin",   passwordHash:"$2a$10$U67Nd/q42cpThMd/9pRtwuTr9UO5DpQ03euRCWyFbil7tanKX2DA6", progress:{}, quizScores:{}, joinedAt:"2024-01-01" },
}

// ── 5. Run ─────────────────────────────────────────────────────────────────
console.log('\n🚀 Migrating users to Postgres...\n')

await createTable()

const blobData = await readFromBlob()
const source   = blobData || SEED

if (!blobData) {
  console.log('⚠️  Blob unavailable — using seed users only.')
  console.log('   Once Vercel Blob is fixed, run this script again to import real data.\n')
}

let count = 0
for (const [username, u] of Object.entries(source)) {
  await insertUser(username, u)
  const tag = u.softDeleted ? ' [soft-deleted]' : ''
  console.log(`  ✓ ${username.padEnd(20)} ${u.role} | ${u.allowedCourse || 'admin'}${tag}`)
  count++
}

const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM app_users`
console.log(`\n✅ Done — ${count} imported, ${n} total in Postgres`)
console.log('\n⚡ Now deploy — students will load from Postgres (no Blob needed).\n')
