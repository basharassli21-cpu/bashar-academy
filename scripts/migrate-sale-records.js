// scripts/migrate-sale-records.js
// Safe, additive migrations for the sale_records system.
// Run: node scripts/migrate-sale-records.js

import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const env = {}
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([^#=\s][^=]*)=(.*)/)
  if (m) env[m[1].trim()] = m[2].trim()
}

const sql = neon(env.DATABASE_URL || env.POSTGRES_URL)

async function run() {
  console.log('🔄 Running sale_records migrations...\n')

  // 1. Add requires_password_change to app_users (for auto-created student accounts)
  await sql`ALTER TABLE app_users ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE`
  console.log('✅ app_users.requires_password_change')

  // 2. Add note_type + call_status + duration to lead_notes (CRM enhancement)
  await sql`ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS note_type TEXT DEFAULT 'note'`
  await sql`ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS call_status TEXT`
  await sql`ALTER TABLE lead_notes ADD COLUMN IF NOT EXISTS duration_minutes INTEGER`
  console.log('✅ lead_notes enhancements (note_type, call_status, duration_minutes)')

  // 3. Create sale_records table
  await sql`
    CREATE TABLE IF NOT EXISTS sale_records (
      id               SERIAL PRIMARY KEY,
      employee_id      INTEGER NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
      student_name     TEXT NOT NULL,
      student_phone    TEXT NOT NULL,
      student_phone_normalized TEXT NOT NULL,
      package_name     TEXT NOT NULL CHECK (package_name IN ('elite','professional','starter')),
      sale_date        DATE NOT NULL DEFAULT CURRENT_DATE,
      notes            TEXT,
      proof_image_url  TEXT NOT NULL,
      student_username TEXT,
      student_account_created  BOOLEAN DEFAULT FALSE,
      student_account_existing BOOLEAN DEFAULT FALSE,
      created_at       TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✅ sale_records table')

  // 4. Unique index to prevent duplicate (same employee, same phone, same day)
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS sale_records_no_dup
    ON sale_records(employee_id, student_phone_normalized, sale_date)
  `
  console.log('✅ sale_records unique index (no duplicate per employee+phone+day)')

  // 5. Performance indexes
  await sql`CREATE INDEX IF NOT EXISTS sale_records_employee_date ON sale_records(employee_id, sale_date DESC)`
  await sql`CREATE INDEX IF NOT EXISTS sale_records_date ON sale_records(sale_date DESC)`
  console.log('✅ sale_records indexes')

  console.log('\n🎉 All migrations completed successfully.')
  process.exit(0)
}

run().catch(e => { console.error('❌', e.message); process.exit(1) })
