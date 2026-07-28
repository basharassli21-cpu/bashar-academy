// scripts/migrate-rate-limit.js
// Creates the login_rate_limit table used by the DB-backed brute force protection.
// Run once: node --env-file=.env.local scripts/migrate-rate-limit.js

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function run() {
  console.log('🔐 Creating login_rate_limit table...')

  await sql`
    CREATE TABLE IF NOT EXISTS login_rate_limit (
      ip           TEXT        NOT NULL,
      window_start TIMESTAMPTZ NOT NULL,
      attempts     INT         NOT NULL DEFAULT 1,
      PRIMARY KEY (ip, window_start)
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_ratelimit_window
    ON login_rate_limit(window_start)
  `

  console.log('✅ login_rate_limit table ready')
  console.log('   The login API will now use persistent DB rate limiting.')
}

run().catch(e => { console.error('❌', e.message); process.exit(1) })
