// Run with: node -r dotenv/config scripts/migrate-improvements.js
// Adds: account lockout columns, performance indexes, admin audit log table

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function run() {
  console.log('1/4 Adding account lockout columns to employees...')
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0`
  await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ`

  console.log('2/4 Adding performance indexes...')
  await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_employee_status ON leads(employee_id, status)`
  await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_followup ON leads(next_followup_date) WHERE next_followup_date IS NOT NULL`
  await sql`CREATE INDEX IF NOT EXISTS idx_leads_updated ON leads(updated_at DESC)`

  console.log('3/4 Creating admin_audit_log table...')
  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id          SERIAL PRIMARY KEY,
      actor_username VARCHAR(50),
      actor_role  VARCHAR(20),
      action      VARCHAR(50) NOT NULL,
      target_type VARCHAR(30),
      target_id   INTEGER,
      details     JSONB,
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON admin_audit_log(actor_username)`

  console.log('4/4 Done! All migrations applied.')
  process.exit(0)
}

run().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
